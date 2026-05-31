import type { CharacterStats, GameState } from '../types/game';
import { applyStatDelta } from './gameLogic';
import { monthsInRelationship } from './partnerLogic';

export const CHILD_MONTHLY_COST = 38;
export const EXTRA_CHILD_COST = 25;

export function getChildrenMonthlyCost(childrenCount: number): number {
  if (childrenCount <= 0) return 0;
  return CHILD_MONTHLY_COST + Math.max(0, childrenCount - 1) * EXTRA_CHILD_COST;
}

export function canHaveChildrenEvent(state: GameState): boolean {
  if (state.hasChildren) return false;
  if (state.relationshipStatus !== 'dating' && state.relationshipStatus !== 'married') {
    return false;
  }
  const months = monthsInRelationship(state.relationshipStartedAt, state.time);
  return months >= 18;
}

export function processFamilyMonthly(
  stats: CharacterStats,
  state: Pick<
    GameState,
    'hasChildren' | 'childrenCount' | 'relationshipScore' | 'stats'
  >,
): { stats: CharacterStats; extraExpense: number } {
  if (!state.hasChildren || state.childrenCount <= 0) {
    return { stats, extraExpense: 0 };
  }

  let currentStats = { ...stats };
  const extraExpense = getChildrenMonthlyCost(state.childrenCount);
  const lowResources =
    stats.money < 80 && stats.energy < 30;

  if (state.relationshipScore >= 50 && !lowResources) {
    currentStats = applyStatDelta(currentStats, {
      happiness: 3,
      mentalHealth: 2,
      stress: -2,
    });
  } else if (lowResources) {
    currentStats = applyStatDelta(currentStats, {
      stress: 8,
      happiness: -5,
      mentalHealth: -3,
    });
  }

  return { stats: currentStats, extraExpense };
}

export function applyChildrenFromChoice(
  hasChildren: boolean,
  childrenCount: number,
  choiceHas?: boolean,
  delta?: number,
): { hasChildren: boolean; childrenCount: number } {
  if (!choiceHas && delta === undefined) {
    return { hasChildren, childrenCount };
  }
  const nextHas = choiceHas ?? hasChildren;
  const nextCount = Math.min(
    5,
    Math.max(0, childrenCount + (delta ?? (choiceHas ? 1 : 0))),
  );
  return {
    hasChildren: nextHas || nextCount > 0,
    childrenCount: nextCount > 0 ? nextCount : childrenCount,
  };
}
