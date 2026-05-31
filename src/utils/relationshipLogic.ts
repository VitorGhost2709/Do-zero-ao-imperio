import type {
  CharacterStats,
  EventChoice,
  RelationshipStatus,
  TimeState,
} from '../types/game';
import { applyStatDelta, formatHistoryLine } from './gameLogic';

export const RELATIONSHIP_MIN = 0;
export const RELATIONSHIP_MAX = 100;
export const MARRIED_MONTHLY_COST = 35;
export const DATING_MONTHLY_COST = 12;

const STATUS_LABELS: Record<RelationshipStatus, string> = {
  single: 'Solteiro',
  dating: 'Namorando',
  married: 'Casado',
  separated: 'Separado',
};

export function getRelationshipStatusLabel(status: RelationshipStatus): string {
  return STATUS_LABELS[status];
}

export function clampRelationshipScore(score: number): number {
  return Math.max(RELATIONSHIP_MIN, Math.min(RELATIONSHIP_MAX, score));
}

export function applyRelationshipChoice(
  status: RelationshipStatus,
  score: number,
  choice: EventChoice,
): { status: RelationshipStatus; score: number } {
  let newStatus = status;
  let newScore = score;

  if (choice.relationshipStatus) {
    newStatus = choice.relationshipStatus;
    if (newStatus === 'dating' && score < 40) newScore = 45;
    if (newStatus === 'married' && score < 55) newScore = 60;
    if (newStatus === 'separated') newScore = Math.min(newScore, 35);
    if (newStatus === 'single') newScore = Math.min(newScore, 25);
  }

  if (choice.relationshipScore !== undefined) {
    newScore = clampRelationshipScore(newScore + choice.relationshipScore);
  }

  return { status: newStatus, score: newScore };
}

export function processRelationshipMonthly(
  stats: CharacterStats,
  status: RelationshipStatus,
  score: number,
  time: TimeState,
): {
  stats: CharacterStats;
  status: RelationshipStatus;
  score: number;
  messages: string[];
  extraExpense: number;
} {
  const messages: string[] = [];
  let currentStats = { ...stats };
  let currentStatus = status;
  let currentScore = score;
  let extraExpense = 0;

  if (status === 'married') extraExpense = MARRIED_MONTHLY_COST;
  if (status === 'dating') extraExpense = DATING_MONTHLY_COST;

  if (status === 'dating' || status === 'married') {
    if (score >= 70) {
      currentStats = applyStatDelta(currentStats, {
        happiness: 4,
        mentalHealth: 3,
        stress: -4,
      });
    } else if (score >= 45) {
      currentStats = applyStatDelta(currentStats, { happiness: 1, stress: -1 });
    } else if (score < 30) {
      currentStats = applyStatDelta(currentStats, {
        stress: 10,
        happiness: -8,
        mentalHealth: -5,
      });
      messages.push(
        formatHistoryLine(time, 'relacionamento esfriou.'),
      );
      if (score < 15 && status === 'dating') {
        currentStatus = 'separated';
        currentScore = 20;
        messages.push(formatHistoryLine(time, 'namoro terminou.'));
      }
      if (score < 12 && status === 'married') {
        currentStatus = 'separated';
        currentScore = 15;
        messages.push(formatHistoryLine(time, 'separação conjugal.'));
      }
    }
  }

  if (status === 'separated' && score < 20) {
    currentStatus = 'single';
    currentScore = 10;
  }

  return {
    stats: currentStats,
    status: currentStatus,
    score: currentScore,
    messages,
    extraExpense,
  };
}

export function getSocializeRelationshipBonus(
  status: RelationshipStatus,
): { score: number; chanceMeet: number } {
  if (status === 'single') return { score: 4, chanceMeet: 0.12 };
  if (status === 'dating') return { score: 6, chanceMeet: 0 };
  if (status === 'married') return { score: 3, chanceMeet: 0 };
  return { score: 2, chanceMeet: 0.05 };
}
