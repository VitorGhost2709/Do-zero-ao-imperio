import { RANDOM_EVENTS } from '../data/events';
import { FAMILY_EVENTS } from '../data/familyEvents';
import { DELAYED_CONSEQUENCE_EVENTS } from '../data/delayedConsequenceEvents';
import { RARE_EVENTS } from '../data/rareEvents';
import { PATH_EVENTS } from '../data/pathEvents';
import { RELATIONSHIP_EVENTS } from '../data/relationshipEvents';
import { DIFFICULTY_MAP } from '../data/difficulties';
import { getDominantLifePath } from './lifePathLogic';
import { personalizeText } from './partnerLogic';
import { eventMatchesDelayed } from './delayedConsequenceLogic';
import type {
  CharacterStats,
  DifficultyId,
  EventRiskLevel,
  GameEvent,
  GameState,
  LifePathId,
  RelationshipStatus,
} from '../types/game';

const EVENT_RISK: Record<string, EventRiskLevel> = {
  promotion: 'medium',
  overtime: 'medium',
  job_offer: 'medium',
  sick: 'medium',
  health_scare: 'medium',
  friend_loan: 'low',
  special_someone: 'low',
  important_party: 'medium',
  friend_party: 'low',
  expensive_course: 'medium',
  study_scholarship: 'low',
  lucky_find: 'low',
  scam_offer: 'high',
  business_opportunity: 'high',
  family_help: 'medium',
  unethical_proposal: 'high',
  broken_computer: 'medium',
  unexpected_bill: 'medium',
};

const POSITIVE_EVENT_IDS = new Set([
  'promotion',
  'job_offer',
  'study_scholarship',
  'lucky_find',
  'family_help',
  'special_someone',
  'friend_party',
  'important_party',
  'business_opportunity',
  'v7_tax_refund',
  'v7_lucky_invest',
  'rel_meet_special',
  'rel_anniversary',
]);

const NEGATIVE_EVENT_IDS = new Set([
  'sick',
  'health_scare',
  'scam_offer',
  'unethical_proposal',
  'broken_computer',
  'unexpected_bill',
  'overtime',
  'v7_scam_call',
  'v7_identity_theft',
  'path_inf_cancel',
  'rel_breakup',
]);

const DEBT_SOFT = -200;

const RISK_WEIGHTS: Record<EventRiskLevel, number> = {
  low: 40,
  medium: 35,
  high: 18,
  extreme: 5,
};

function resolveRisk(event: GameEvent): EventRiskLevel {
  return event.riskLevel ?? EVENT_RISK[event.id] ?? 'medium';
}

function getPlayerStateBias(stats: CharacterStats, fame: number): {
  negative: number;
  positive: number;
} {
  let negative = 0;
  let positive = 0;

  if (stats.stress >= 70) negative += 0.15;
  if (stats.stress >= 85) negative += 0.1;
  if (stats.money < -150) negative += 0.12;
  if (stats.money < DEBT_SOFT) negative += 0.08;
  if (stats.physicalHealth < 35) negative += 0.1;
  if (stats.mentalHealth < 35) negative += 0.12;
  if (fame >= 60) negative += 0.04;
  if (fame >= 80) negative += 0.03;

  if (stats.happiness >= 65) positive += 0.12;
  if (stats.reputation >= 60) positive += 0.1;
  if (stats.mentalHealth >= 65) positive += 0.1;
  if (stats.money >= 400) positive += 0.06;
  if (fame >= 40) positive += 0.05;

  return { negative, positive };
}

function eventWeight(
  event: GameEvent,
  stats: CharacterStats,
  difficultyId: DifficultyId,
  fame: number,
): number {
  const risk = resolveRisk(event);
  let weight = RISK_WEIGHTS[risk];

  if (risk === 'extreme') weight *= 0.4;

  const bias = getPlayerStateBias(stats, fame);
  const diff = DIFFICULTY_MAP[difficultyId] ?? DIFFICULTY_MAP.normal;

  if (POSITIVE_EVENT_IDS.has(event.id)) {
    weight *= 1 + bias.positive + diff.positiveEventBias;
  }
  if (NEGATIVE_EVENT_IDS.has(event.id)) {
    weight *= 1 + bias.negative + diff.negativeEventBias;
  }

  return Math.max(1, weight);
}

function matchesRelationship(
  event: GameEvent,
  status: RelationshipStatus,
): boolean {
  if (!event.requiresRelationship?.length) return true;
  return event.requiresRelationship.includes(status);
}

function filterPool(events: GameEvent[], state: GameState): GameEvent[] {
  return events
    .filter((e) => !e.requiresConsequence)
    .filter((e) => matchesRelationship(e, state.relationshipStatus))
    .filter((e) => eventMatchesDelayed(e, state))
    .map((e) => ({ ...e, riskLevel: resolveRisk(e) }));
}

function filterDelayedPool(events: GameEvent[], state: GameState): GameEvent[] {
  return events
    .filter((e) => matchesRelationship(e, state.relationshipStatus))
    .filter((e) => eventMatchesDelayed(e, state))
    .map((e) => ({ ...e, riskLevel: resolveRisk(e) }));
}

function weightedPick(events: GameEvent[], weights: number[]): GameEvent {
  const total = weights.reduce((s, w) => s + w, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < events.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return events[i];
  }
  return events[0];
}

function pickFromPool(events: GameEvent[], state: GameState): GameEvent {
  const weights = events.map((e) =>
    eventWeight(e, state.stats, state.difficultyId, state.fame),
  );
  return weightedPick(events, weights);
}

export function personalizeEvent(
  event: GameEvent,
  partnerName?: string,
): GameEvent {
  return {
    ...event,
    title: personalizeText(event.title, partnerName),
    description: personalizeText(event.description, partnerName),
    choices: event.choices.map((c) => ({
      ...c,
      label: personalizeText(c.label, partnerName),
      historyMessage: personalizeText(c.historyMessage, partnerName),
    })),
  };
}

export function getAllEvents(): GameEvent[] {
  return [
    ...RANDOM_EVENTS,
    ...RARE_EVENTS,
    ...PATH_EVENTS,
    ...RELATIONSHIP_EVENTS,
    ...FAMILY_EVENTS,
    ...DELAYED_CONSEQUENCE_EVENTS,
  ].map((e) => ({
    ...e,
    riskLevel: resolveRisk(e),
  }));
}

export function pickRandomEvent(state: GameState): GameEvent {
  const diff = DIFFICULTY_MAP[state.difficultyId] ?? DIFFICULTY_MAP.normal;
  const luckBonus = state.traitId === 'lucky' ? 0.05 : 0;
  const careerBonus = ['businessman', 'executive', 'agency_owner'].includes(
    state.currentCareerId,
  )
    ? 0.03
    : 0;
  const rareChance = diff.rareEventChance + luckBonus + careerBonus;

  if (state.pendingConsequences.length > 0 && Math.random() < 0.35) {
    const delayedPool = filterDelayedPool(DELAYED_CONSEQUENCE_EVENTS, state);
    if (delayedPool.length > 0) {
      return personalizeEvent(
        pickFromPool(delayedPool, state),
        state.partnerName,
      );
    }
  }

  if (Math.random() < rareChance) {
    const rarePool = filterPool(
      [...RARE_EVENTS, ...RANDOM_EVENTS.filter((e) => e.isRare)],
      state,
    );
    if (rarePool.length > 0) {
      return personalizeEvent(
        pickFromPool(rarePool, state),
        state.partnerName,
      );
    }
  }

  const dominant = getDominantLifePath(state.lifePathTracking);
  const pathScore = state.lifePathTracking[dominant];

  if (pathScore >= 6 && Math.random() < 0.28) {
    const pathPool = filterPool(
      PATH_EVENTS.filter((e) => e.lifePath === dominant),
      state,
    );
    if (pathPool.length > 0) {
      return personalizeEvent(
        pickFromPool(pathPool, state),
        state.partnerName,
      );
    }
  }

  if (
    (state.relationshipStatus === 'dating' ||
      state.relationshipStatus === 'married') &&
    Math.random() < 0.14
  ) {
    const familyPool = filterPool(FAMILY_EVENTS, state);
    if (familyPool.length > 0) {
      return personalizeEvent(
        pickFromPool(familyPool, state),
        state.partnerName,
      );
    }
  }

  if (Math.random() < 0.2) {
    const relPool = filterPool(RELATIONSHIP_EVENTS, state);
    if (relPool.length > 0) {
      return personalizeEvent(
        pickFromPool(relPool, state),
        state.partnerName,
      );
    }
  }

  const general = filterPool(
    RANDOM_EVENTS.filter((e) => !e.lifePath),
    state,
  );
  return personalizeEvent(
    pickFromPool(general, state),
    state.partnerName,
  );
}

export function getDominantPathForDisplay(
  tracking: GameState['lifePathTracking'],
): LifePathId {
  return getDominantLifePath(tracking);
}
