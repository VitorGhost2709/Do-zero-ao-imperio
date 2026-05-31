import { MEMORY_MAP } from '../data/memories';
import type { GameState, MemoryId } from '../types/game';

export function unlockMemory(
  unlocked: MemoryId[],
  memoryId: MemoryId,
): MemoryId[] {
  if (unlocked.includes(memoryId)) return unlocked;
  return [...unlocked, memoryId];
}

export function getMemoryTitles(unlocked: MemoryId[]): {
  positive: string[];
  negative: string[];
} {
  const positive: string[] = [];
  const negative: string[] = [];
  unlocked.forEach((id) => {
    const def = MEMORY_MAP[id];
    if (!def) return;
    if (def.tone === 'positive') positive.push(def.title);
    else negative.push(def.title);
  });
  return { positive, negative };
}

export function checkAutomaticMemories(state: GameState): MemoryId[] {
  const toUnlock: MemoryId[] = [];
  const { stats, tracking, unlockedMemories } = state;

  if (tracking.hadBurnout && !unlockedMemories.includes('traumatic_burnout')) {
    toUnlock.push('traumatic_burnout');
  }
  if (tracking.hadHeavyDebt && !unlockedMemories.includes('suffocating_debt')) {
    toUnlock.push('suffocating_debt');
  }
  if (tracking.wasInHeavyDebt && stats.money > 200 && !unlockedMemories.includes('comeback')) {
    toUnlock.push('comeback');
  }

  return toUnlock;
}

export function mergeMemoryUnlocks(
  current: MemoryId[],
  ids: MemoryId[],
): MemoryId[] {
  let next = current;
  ids.forEach((id) => {
    next = unlockMemory(next, id);
  });
  return next;
}
