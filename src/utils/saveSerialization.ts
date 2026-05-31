import type { GameState } from '../types/game';
import type { SaveMetadata } from '../types/save';
import { calculatePatrimony } from './gameLogic';
import { getDominantLifePath } from './lifePathLogic';
import { getPatrimonyContext } from './storage';

/** Estado serializável para localStorage ou nuvem (sem evento ativo). */
export function serializeGameState(state: GameState): GameState {
  return {
    ...state,
    activeEvent: null,
  };
}

export function buildSaveMetadata(state: GameState): SaveMetadata {
  const assets = getPatrimonyContext(state);
  return {
    characterName: state.characterName || 'Jogador',
    currentAge: state.time.age,
    currentMoney: state.stats.money,
    patrimony: calculatePatrimony(state.stats, assets),
    lifePath: getDominantLifePath(state.lifePathTracking),
    difficulty: state.difficultyId,
    isGameOver: Boolean(state.gameOver),
  };
}

export function suggestCloudSaveName(state: GameState): string {
  const meta = buildSaveMetadata(state);
  const date = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  return `Save de ${meta.characterName} - ${date}`;
}
