import { ORIGIN_MAP } from '../data/origins';
import { TRAIT_MAP } from '../data/traits';
import { DIFFICULTY_MAP } from '../data/difficulties';
import type { DifficultyId, GameState, OriginId, TraitId } from '../types/game';
import { createDefaultLifePathTracking } from '../types/game';
import {
  applyStatDelta,
  createInitialStats,
  createInitialTime,
  formatNarrative,
} from './gameLogic';
import { addDiaryMilestone } from './lifeDiaryLogic';
import { createDefaultTracking, getDefaultGameState } from './storage';

export function createGameStateFromProfile(
  name: string,
  originId: OriginId,
  traitId: TraitId,
  difficultyId: DifficultyId = 'normal',
): GameState {
  const origin = ORIGIN_MAP[originId];
  const trait = TRAIT_MAP[traitId];
  const difficulty = DIFFICULTY_MAP[difficultyId];
  const time = createInitialTime();
  const stats = applyStatDelta(createInitialStats(), origin.statModifiers);

  return {
    ...getDefaultGameState(),
    stats,
    time,
    characterName: name.trim() || 'Jogador',
    originId,
    traitId,
    profileComplete: true,
    difficultyId,
    businessLevels: {},
    isRetired: false,
    relationshipStatus: 'single',
    relationshipScore: 0,
    fame: 0,
    lifePathTracking: createDefaultLifePathTracking(),
    completedObjectiveIds: [],
    unlockedAchievementIds: [],
    achievementUnlockMeta: {},
    tracking: createDefaultTracking(),
    lifeDiary: addDiaryMilestone([], 'character_created', time),
    hasChildren: false,
    childrenCount: 0,
    unlockedMemories: [],
    pendingConsequences: [],
    history: [
      {
        id: crypto.randomUUID(),
        message: formatNarrative(
          time,
          `${origin.narrativePhrase} Seu traço principal é ser ${trait.name.toLowerCase()}. Dificuldade: ${difficulty.name}.`,
        ),
        timestamp: Date.now(),
      },
    ],
  };
}
