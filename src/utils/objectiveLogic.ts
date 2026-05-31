import { OBJECTIVES } from '../data/objectives';
import type {
  GameState,
  Objective,
  ObjectiveReward,
  StatDelta,
} from '../types/game';
import { calculatePatrimony } from './gameLogic';
import { getPatrimonyContext } from './storage';

export function isObjectiveComplete(
  objective: Objective,
  state: GameState,
): boolean {
  const { conditionType, conditionValue } = objective;
  const { stats } = state;
  const assets = getPatrimonyContext(state);
  const patrimony = calculatePatrimony(stats, assets);

  switch (conditionType) {
    case 'money_gte':
      return stats.money >= (conditionValue as number);
    case 'patrimony_gte':
      return patrimony >= (conditionValue as number);
    case 'career_not':
      return state.currentCareerId !== conditionValue;
    case 'career_is':
      return state.currentCareerId === conditionValue;
    case 'upgrade_count_gte':
      return state.purchasedUpgrades.length >= (conditionValue as number);
    case 'housing_not':
      return state.currentHousingId !== conditionValue;
    case 'owns_housing':
      return state.ownedHousingIds.includes(conditionValue as string);
    case 'business_count_gte':
      return state.ownedBusinessIds.length >= (conditionValue as number);
    case 'age_gte':
      return state.time.age >= (conditionValue as number) && !state.gameOver;
    case 'mental_health_gte':
      return stats.mentalHealth >= (conditionValue as number);
    default:
      return false;
  }
}

export function rewardToStatDelta(reward: ObjectiveReward): StatDelta {
  return { ...reward };
}

export interface CompletedObjectiveResult {
  newlyCompleted: Objective[];
}

export function checkObjectives(state: GameState): CompletedObjectiveResult {
  const newlyCompleted: Objective[] = [];

  OBJECTIVES.forEach((obj) => {
    if (state.completedObjectiveIds.includes(obj.id)) return;
    if (isObjectiveComplete(obj, state)) {
      newlyCompleted.push(obj);
    }
  });

  return { newlyCompleted };
}
