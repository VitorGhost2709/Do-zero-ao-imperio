import type { CharacterStats, GameState } from '../types/game';
import { applyStatDelta } from './gameLogic';

export const FAME_MIN = 0;
export const FAME_MAX = 100;

export function clampFame(fame: number): number {
  return Math.max(FAME_MIN, Math.min(FAME_MAX, fame));
}

export function addFame(fame: number, delta: number): number {
  return clampFame(fame + delta);
}

export function getFameTier(fame: number): {
  label: string;
  opportunityBonus: number;
  riskBonus: number;
} {
  if (fame >= 75) {
    return { label: 'Celebridade', opportunityBonus: 0.15, riskBonus: 0.12 };
  }
  if (fame >= 50) {
    return { label: 'Muito conhecido', opportunityBonus: 0.1, riskBonus: 0.08 };
  }
  if (fame >= 25) {
    return { label: 'Em ascensão', opportunityBonus: 0.05, riskBonus: 0.04 };
  }
  if (fame >= 10) {
    return { label: 'Alguma visibilidade', opportunityBonus: 0.02, riskBonus: 0.02 };
  }
  return { label: 'Discreto', opportunityBonus: 0, riskBonus: 0 };
}

export function updateFameFromAction(
  fame: number,
  actionId: string,
  stats: CharacterStats,
): number {
  let next = fame;
  if (actionId === 'socialize' && stats.charisma >= 50) next += 1;
  return clampFame(next);
}

export function updateFameFromState(state: Pick<GameState, 'fame' | 'ownedBusinessIds' | 'currentCareerId' | 'stats'>): number {
  let next = state.fame;
  if (state.ownedBusinessIds.length >= 2) next += 0.5;
  if (['executive', 'director', 'agency_owner', 'businessman'].includes(state.currentCareerId)) {
    next += 1;
  }
  if (state.stats.reputation >= 70) next += 0.5;
  return clampFame(Math.floor(next));
}

export function applyFameMonthlyEffects(
  stats: CharacterStats,
  fame: number,
): CharacterStats {
  const tier = getFameTier(fame);
  if (fame >= 50) {
    return applyStatDelta(stats, {
      reputation: 1,
      stress: fame >= 75 ? 1 : 0,
    });
  }
  if (tier.opportunityBonus > 0 && fame >= 25) {
    return applyStatDelta(stats, { happiness: 1 });
  }
  return stats;
}
