import type { EventChoice, GameState } from '../types/game';
import { addFame } from './fameLogic';
import { applyRelationshipChoice } from './relationshipLogic';
import { applyStatDelta } from './gameLogic';

export function applyEventChoiceToState(
  state: Pick<
    GameState,
    'stats' | 'relationshipStatus' | 'relationshipScore' | 'fame'
  >,
  choice: EventChoice,
): Pick<
  GameState,
  'stats' | 'relationshipStatus' | 'relationshipScore' | 'fame'
> {
  let stats = applyStatDelta(state.stats, choice.effects);
  const rel = applyRelationshipChoice(
    state.relationshipStatus,
    state.relationshipScore,
    choice,
  );
  let fame = state.fame;
  const fameDelta = choice.fame ?? choice.effects.fame;
  if (fameDelta !== undefined) {
    fame = addFame(fame, fameDelta);
  }
  let score = rel.score;
  const relDelta = choice.relationshipScore ?? choice.effects.relationshipScore;
  if (relDelta !== undefined && !choice.relationshipScore) {
    score = applyRelationshipChoice(rel.status, score, {
      ...choice,
      relationshipScore: relDelta,
    }).score;
  }

  return {
    stats,
    relationshipStatus: rel.status,
    relationshipScore: score,
    fame,
  };
}
