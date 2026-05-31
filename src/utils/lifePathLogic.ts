import { LIFE_PATH_MAP } from '../data/lifePaths';
import type {
  ActionId,
  GameState,
  LifePathId,
  LifePathTracking,
} from '../types/game';
import { createDefaultLifePathTracking } from '../types/game';

const CORPORATE_CAREERS = new Set([
  'intern',
  'analyst',
  'coordinator',
  'manager',
  'director',
  'executive',
  'attendant',
  'admin_assistant',
  'businessman',
  'salesperson',
]);

const TECH_CAREERS = new Set([
  'junior_developer',
  'mid_developer',
  'senior_developer',
  'ai_specialist',
  'freelancer',
]);

export function getDominantLifePath(
  tracking: LifePathTracking,
): LifePathId {
  const entries = Object.entries(tracking) as [LifePathId, number][];
  entries.sort((a, b) => b[1] - a[1]);
  if (entries[0][1] <= 0) return 'balanced';
  return entries[0][0];
}

export function getDominantLifePathLabel(tracking: LifePathTracking): string {
  const id = getDominantLifePath(tracking);
  return LIFE_PATH_MAP[id]?.name ?? 'Indefinido';
}

export function updateLifePathFromAction(
  tracking: LifePathTracking,
  actionId: ActionId,
  state: Pick<GameState, 'stats' | 'currentCareerId'>,
): LifePathTracking {
  const next = { ...tracking };

  switch (actionId) {
    case 'work':
      next.corporate += 2;
      if (TECH_CAREERS.has(state.currentCareerId)) next.tech += 1;
      break;
    case 'study':
      next.tech += 3;
      break;
    case 'socialize':
      next.digital_influence += 3;
      break;
    case 'invest':
      next.investments += 4;
      break;
    case 'rest':
    case 'train':
      if (isBalancedStats(state.stats)) next.balanced += 2;
      break;
    default:
      break;
  }

  return next;
}

export function updateLifePathFromCareerChange(
  tracking: LifePathTracking,
  careerId: string,
): LifePathTracking {
  const next = { ...tracking };
  if (CORPORATE_CAREERS.has(careerId)) next.corporate += 5;
  if (TECH_CAREERS.has(careerId)) next.tech += 5;
  if (careerId === 'marketing_strategist' || careerId === 'agency_owner') {
    next.digital_influence += 4;
  }
  return next;
}

export function updateLifePathFromBusiness(
  tracking: LifePathTracking,
  isUpgrade: boolean,
): LifePathTracking {
  return {
    ...tracking,
    entrepreneur: tracking.entrepreneur + (isUpgrade ? 3 : 6),
  };
}

function isBalancedStats(stats: GameState['stats']): boolean {
  return (
    stats.happiness >= 55 &&
    stats.mentalHealth >= 50 &&
    stats.physicalHealth >= 50 &&
    stats.stress <= 55 &&
    stats.money >= 0
  );
}

export function createLifePathTracking(): LifePathTracking {
  return createDefaultLifePathTracking();
}

export function getLifePathProgress(
  tracking: LifePathTracking,
  pathId: LifePathId,
): number {
  const total = Object.values(tracking).reduce((s, v) => s + v, 0);
  if (total === 0) return 0;
  return Math.round((tracking[pathId] / total) * 100);
}
