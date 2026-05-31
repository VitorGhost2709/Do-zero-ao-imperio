import { MIN_RETIREMENT_AGE } from '../data/difficulties';
import type { GameState } from '../types/game';

export function canRetire(state: GameState): boolean {
  return (
    !state.gameOver &&
    !state.isRetired &&
    !state.activeEvent &&
    state.profileComplete &&
    state.time.age >= MIN_RETIREMENT_AGE
  );
}
