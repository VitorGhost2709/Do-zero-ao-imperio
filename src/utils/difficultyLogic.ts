import { DIFFICULTY_MAP, DEFAULT_DIFFICULTY_ID } from '../data/difficulties';
import type { DifficultyId, StatDelta } from '../types/game';

export function getDifficulty(id: DifficultyId = DEFAULT_DIFFICULTY_ID) {
  return DIFFICULTY_MAP[id] ?? DIFFICULTY_MAP.normal;
}

export function scaleMoneyReward(amount: number, difficultyId: DifficultyId): number {
  if (amount <= 0) return amount;
  const d = getDifficulty(difficultyId);
  return Math.round(amount * d.rewardMultiplier);
}

export function applyDifficultyToActionDelta(
  delta: StatDelta,
  difficultyId: DifficultyId,
): StatDelta {
  const d = getDifficulty(difficultyId);
  const next: StatDelta = { ...delta };

  if (next.stress !== undefined && next.stress > 0) {
    next.stress = Math.round(next.stress * d.stressGainMultiplier);
  }
  if (next.stress !== undefined && next.stress < 0) {
    next.stress = Math.round(next.stress * d.stressReliefMultiplier);
  }
  if (next.energy !== undefined && next.energy < 0) {
    next.energy = Math.round(next.energy * d.actionEnergyDrainMultiplier);
  }
  if (next.money !== undefined && next.money > 0) {
    next.money = scaleMoneyReward(next.money, difficultyId);
  }

  return next;
}

export function getBurnoutThreshold(difficultyId: DifficultyId): number {
  return getDifficulty(difficultyId).burnoutThreshold;
}
