import { ACHIEVEMENTS } from '../data/achievements';
import type { Achievement, GameState } from '../types/game';
import { calculatePatrimony } from './gameLogic';
import { getPatrimonyContext } from './storage';

function checkAchievement(
  achievement: Achievement,
  state: GameState,
): boolean {
  const { conditionType, conditionValue } = achievement;
  const { stats, tracking } = state;
  const assets = getPatrimonyContext(state);
  const patrimony = calculatePatrimony(stats, assets);

  switch (conditionType) {
    case 'worked_once':
      return tracking.workedOnce;
    case 'had_burnout':
      return tracking.hadBurnout;
    case 'near_death':
      return tracking.hadNearDeath;
    case 'rich_young':
      return patrimony >= 5000 && state.time.age < 30;
    case 'business_count_gte':
      return state.ownedBusinessIds.length >= (conditionValue ?? 3);
    case 'intelligence_gte':
      return stats.intelligence >= (conditionValue ?? 90);
    case 'balanced_stats':
      return (
        stats.happiness >= 60 &&
        stats.physicalHealth >= 60 &&
        stats.mentalHealth >= 60 &&
        stats.stress < 40
      );
    case 'work_count_gte':
      return tracking.workCount >= (conditionValue ?? 25);
    case 'invest_wins_gte':
      return tracking.investWins >= (conditionValue ?? 3);
    case 'had_heavy_debt':
      return tracking.hadHeavyDebt;
    case 'comeback':
      return tracking.wasInHeavyDebt && patrimony >= 2000;
    default:
      return false;
  }
}

export interface UnlockedAchievementResult {
  newlyUnlocked: Achievement[];
}

export function checkAchievements(state: GameState): UnlockedAchievementResult {
  const newlyUnlocked: Achievement[] = [];

  ACHIEVEMENTS.forEach((ach) => {
    if (state.unlockedAchievementIds.includes(ach.id)) return;
    if (checkAchievement(ach, state)) {
      newlyUnlocked.push(ach);
    }
  });

  return { newlyUnlocked };
}

export function updateTracking(
  state: GameState,
  actionId?: string,
  flags?: { investGain?: boolean; burnout?: boolean },
): GameState['tracking'] {
  const tracking = { ...state.tracking };

  if (actionId === 'work') {
    tracking.workCount += 1;
    tracking.workedOnce = true;
  }
  if (flags?.investGain) tracking.investWins += 1;
  if (flags?.burnout) tracking.hadBurnout = true;

  if (state.stats.physicalHealth <= 15) tracking.hadNearDeath = true;
  if (state.stats.money < -300) {
    tracking.hadHeavyDebt = true;
    tracking.wasInHeavyDebt = true;
  }

  return tracking;
}
