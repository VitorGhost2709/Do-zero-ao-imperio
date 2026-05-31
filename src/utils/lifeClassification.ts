import { LIFE_CLASSIFICATION_LABELS } from '../data/lifeClassifications';
import type {
  CharacterStats,
  DifficultyId,
  GameOverType,
  LifeClassificationId,
  LifePathId,
} from '../types/game';

export interface ClassificationInput {
  type: GameOverType;
  stats: CharacterStats;
  patrimony: number;
  age: number;
  careerId: string;
  businessCount: number;
  achievementCount: number;
  difficultyId: DifficultyId;
  monthsLived: number;
  dominantLifePathId: LifePathId;
  fame: number;
}

export function classifyLife(input: ClassificationInput): {
  id: LifeClassificationId;
  label: string;
} {
  const {
    type,
    stats,
    patrimony,
    age,
    careerId,
    businessCount,
    achievementCount,
    difficultyId,
    monthsLived,
    dominantLifePathId,
    fame,
  } = input;

  if (type === 'retirement') {
    if (dominantLifePathId === 'balanced') return pick('balanced_life_fulfilled');
    if (dominantLifePathId === 'corporate' && patrimony >= 8000) {
      return pick('corporate_legend');
    }
    if (patrimony >= 15000 && businessCount >= 2) return pick('empire_legend');
    if (patrimony >= 5000) return pick('retired_peaceful');
    return pick('simple_happy_life');
  }

  if (dominantLifePathId === 'tech' && patrimony >= 6000 && stats.intelligence >= 70) {
    return pick('tech_genius');
  }
  if (dominantLifePathId === 'digital_influence' && fame >= 65) {
    if (type === 'mental_collapse' || stats.stress >= 80) {
      return pick('unstable_celebrity');
    }
    if (patrimony >= 4000) return pick('unstable_celebrity');
  }
  if (dominantLifePathId === 'investments' && patrimony >= 10000) {
    return pick('investment_magnate');
  }
  if (dominantLifePathId === 'entrepreneur' && businessCount >= 2 && patrimony >= 8000) {
    return pick('visionary_founder');
  }
  if (dominantLifePathId === 'corporate' && ['executive', 'director', 'businessman'].includes(careerId) && patrimony >= 5000) {
    return pick('corporate_legend');
  }
  if (dominantLifePathId === 'balanced' && stats.happiness >= 60 && stats.stress < 55) {
    return pick('balanced_life_fulfilled');
  }

  if (type === 'mental_collapse' && patrimony >= 4000) {
    return pick('rich_unbalanced');
  }

  if (type === 'mental_collapse' || (type === 'death' && stats.stress >= 75)) {
    if (patrimony >= 2500 && achievementCount < 3) {
      return pick('ambition_tragedy');
    }
    return pick('ambition_tragedy');
  }

  if (patrimony >= 25000 && businessCount >= 3 && careerId === 'businessman') {
    return pick('empire_legend');
  }

  if (patrimony >= 12000 && businessCount >= 2) {
    return pick('magnate');
  }

  if (
    patrimony >= 5000 &&
    (careerId === 'businessman' || careerId === 'small_entrepreneur') &&
    stats.reputation >= 55
  ) {
    return pick('respected_entrepreneur');
  }

  if (
    stats.happiness >= 65 &&
    stats.mentalHealth >= 60 &&
    patrimony < 3000 &&
    stats.stress < 50
  ) {
    return pick('simple_happy_life');
  }

  if (patrimony >= 3500 && (stats.physicalHealth < 30 || stats.mentalHealth < 30)) {
    return pick('rich_unbalanced');
  }

  if (age < 35 && patrimony >= 2000) {
    return pick('broken_promise');
  }

  if (patrimony < 800 && monthsLived < 24) {
    return pick('survivor');
  }

  if (difficultyId === 'survival' && achievementCount >= 4) {
    return pick('survivor');
  }

  return pick('common_worker');
}

function pick(id: LifeClassificationId) {
  return { id, label: LIFE_CLASSIFICATION_LABELS[id] };
}
