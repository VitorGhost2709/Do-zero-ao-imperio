import { BUSINESS_MAP } from '../data/businesses';
import { CAREER_MAP } from '../data/careers';
import { HOUSING_MAP } from '../data/housing';
import { UPGRADES } from '../data/upgrades';
import type {
  CharacterStats,
  ConsequenceTag,
  GameState,
  MemoryId,
  RelationshipStatus,
} from '../types/game';
import {
  createDefaultLifePathTracking,
  INITIAL_CAREER_ID,
  INITIAL_HOUSING_ID,
  STAT_LIMITS,
} from '../types/game';
import { pickRandomPartnerName } from './partnerLogic';
import { createDefaultTracking } from './storage';

const VALID_CONSEQUENCE_TAGS: ConsequenceTag[] = [
  'promised_partner_change',
  'dubious_proposal_accepted',
  'ignored_health_warning',
  'fought_with_partner',
  'risky_debt',
  'helped_important_friend',
];

const VALID_MEMORY_IDS: MemoryId[] = [
  'first_big_salary',
  'unforgettable_trip',
  'happy_marriage',
  'life_changing_business',
  'comeback',
  'traumatic_burnout',
  'suffocating_debt',
  'painful_breakup',
  'public_failure',
  'missed_opportunity',
];

const VALID_RELATIONSHIP: RelationshipStatus[] = [
  'single',
  'dating',
  'married',
  'separated',
];

function clampStatValue(value: unknown, isMoney = false): number {
  const n = typeof value === 'number' && !Number.isNaN(value) ? value : 0;
  if (isMoney) return n;
  return Math.max(STAT_LIMITS.min, Math.min(STAT_LIMITS.max, n));
}

function normalizeStats(raw: Partial<CharacterStats> | undefined): CharacterStats {
  return {
    money: clampStatValue(raw?.money, true),
    energy: clampStatValue(raw?.energy),
    physicalHealth: clampStatValue(raw?.physicalHealth),
    mentalHealth: clampStatValue(raw?.mentalHealth),
    happiness: clampStatValue(raw?.happiness),
    reputation: clampStatValue(raw?.reputation),
    stress: clampStatValue(raw?.stress),
    intelligence: clampStatValue(raw?.intelligence),
    charisma: clampStatValue(raw?.charisma),
  };
}

function fallbackRelationshipStartedAt(
  time: GameState['time'],
): GameState['relationshipStartedAt'] {
  let month = time.month - 20;
  let age = time.age;
  while (month < 1) {
    month += 12;
    age -= 1;
  }
  return { age: Math.max(18, age), month };
}

/** Normaliza saves antigos ou parcialmente corrompidos antes de entrar no jogo. */
export function migrateGameState(parsed: Partial<GameState>): GameState | null {
  if (!parsed.stats || !parsed.time) return null;

  const age =
    typeof parsed.time.age === 'number' ? Math.max(18, parsed.time.age) : 18;
  const month =
    typeof parsed.time.month === 'number'
      ? Math.max(1, Math.min(12, parsed.time.month))
      : 1;

  const ownedBusinessIds = (parsed.ownedBusinessIds ?? []).filter(
    (id) => BUSINESS_MAP[id],
  );
  const businessLevels: Record<string, number> = {};
  Object.entries(parsed.businessLevels ?? {}).forEach(([id, level]) => {
    if (ownedBusinessIds.includes(id) && typeof level === 'number') {
      businessLevels[id] = Math.max(1, Math.min(10, Math.floor(level)));
    }
  });

  const ownedHousingIds = (parsed.ownedHousingIds ?? [INITIAL_HOUSING_ID]).filter(
    (id) => HOUSING_MAP[id],
  );
  if (ownedHousingIds.length === 0) ownedHousingIds.push(INITIAL_HOUSING_ID);

  let currentCareerId = parsed.currentCareerId ?? INITIAL_CAREER_ID;
  if (!CAREER_MAP[currentCareerId]) currentCareerId = INITIAL_CAREER_ID;

  let currentHousingId = parsed.currentHousingId ?? INITIAL_HOUSING_ID;
  if (!HOUSING_MAP[currentHousingId]) currentHousingId = INITIAL_HOUSING_ID;
  if (
    HOUSING_MAP[currentHousingId]?.type === 'owned' &&
    !ownedHousingIds.includes(currentHousingId)
  ) {
    currentHousingId = ownedHousingIds[0] ?? INITIAL_HOUSING_ID;
  }

  let relationshipStatus = parsed.relationshipStatus ?? 'single';
  if (!VALID_RELATIONSHIP.includes(relationshipStatus)) {
    relationshipStatus = 'single';
  }

  let relationshipScore =
    typeof parsed.relationshipScore === 'number'
      ? Math.max(0, Math.min(100, parsed.relationshipScore))
      : 0;

  let partnerName = parsed.partnerName;
  let exPartnerName = parsed.exPartnerName;
  let relationshipStartedAt = parsed.relationshipStartedAt;

  if (relationshipStatus === 'single') {
    partnerName = undefined;
    relationshipStartedAt = undefined;
    relationshipScore = Math.min(relationshipScore, 30);
  }

  if (relationshipStatus === 'dating' || relationshipStatus === 'married') {
    if (!partnerName) partnerName = pickRandomPartnerName(exPartnerName);
    if (!relationshipStartedAt) {
      relationshipStartedAt = fallbackRelationshipStartedAt({ age, month });
    }
  }

  if (relationshipStatus === 'separated') {
    if (!partnerName && exPartnerName) partnerName = exPartnerName;
    if (!partnerName) partnerName = pickRandomPartnerName();
  }

  let hasChildren = Boolean(parsed.hasChildren);
  let childrenCount =
    typeof parsed.childrenCount === 'number'
      ? Math.max(0, Math.min(5, Math.floor(parsed.childrenCount)))
      : 0;

  if (hasChildren && childrenCount === 0) childrenCount = 1;
  if (!hasChildren) childrenCount = 0;
  if (
    hasChildren &&
    relationshipStatus !== 'dating' &&
    relationshipStatus !== 'married'
  ) {
    hasChildren = false;
    childrenCount = 0;
  }

  const pendingConsequences = (parsed.pendingConsequences ?? []).filter((t) =>
    VALID_CONSEQUENCE_TAGS.includes(t as ConsequenceTag),
  ) as ConsequenceTag[];

  const unlockedMemories = (parsed.unlockedMemories ?? []).filter((m) =>
    VALID_MEMORY_IDS.includes(m as MemoryId),
  ) as MemoryId[];

  const lifeDiary = (parsed.lifeDiary ?? []).map((entry) => ({
    ...entry,
    type: entry.type ?? 'legacy',
    age: entry.age ?? age,
    month: entry.month ?? month,
  }));

  const isLegacy = parsed.profileComplete === undefined;

  return {
    stats: normalizeStats(parsed.stats),
    time: { age, month },
    purchasedUpgrades: (parsed.purchasedUpgrades ?? []).filter((id) =>
      UPGRADES.some((u) => u.id === id),
    ),
    history: Array.isArray(parsed.history) ? parsed.history : [],
    actionsSinceLastEvent: parsed.actionsSinceLastEvent ?? 0,
    activeEvent: null,
    gameOver: null,
    totalActions: parsed.totalActions ?? 0,
    exhaustionCounter: parsed.exhaustionCounter ?? 0,
    currentCareerId,
    currentHousingId,
    ownedHousingIds,
    ownedBusinessIds,
    characterName:
      typeof parsed.characterName === 'string' && parsed.characterName.trim()
        ? parsed.characterName.trim()
        : isLegacy
          ? 'Jogador'
          : '',
    originId: parsed.originId ?? 'middle_class',
    traitId: parsed.traitId ?? 'resilient',
    profileComplete: isLegacy ? true : Boolean(parsed.profileComplete),
    completedObjectiveIds: parsed.completedObjectiveIds ?? [],
    unlockedAchievementIds: parsed.unlockedAchievementIds ?? [],
    achievementUnlockMeta: parsed.achievementUnlockMeta ?? {},
    difficultyId: parsed.difficultyId ?? 'normal',
    businessLevels,
    isRetired: Boolean(parsed.isRetired) && Boolean(parsed.gameOver),
    relationshipStatus,
    relationshipScore,
    fame:
      typeof parsed.fame === 'number'
        ? Math.max(0, Math.min(100, parsed.fame))
        : 0,
    lifePathTracking: {
      ...createDefaultLifePathTracking(),
      ...parsed.lifePathTracking,
    },
    tracking: { ...createDefaultTracking(), ...parsed.tracking },
    lifeDiary,
    partnerName,
    exPartnerName,
    relationshipStartedAt,
    hasChildren,
    childrenCount,
    unlockedMemories,
    pendingConsequences,
  };
}
