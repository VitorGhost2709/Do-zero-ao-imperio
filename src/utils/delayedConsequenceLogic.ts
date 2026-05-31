import type { ConsequenceTag, EventChoice, GameEvent, GameState } from '../types/game';

export function addConsequenceTag(
  pending: ConsequenceTag[],
  tag: ConsequenceTag,
): ConsequenceTag[] {
  if (pending.includes(tag)) return pending;
  return [...pending, tag];
}

export function removeConsequenceTag(
  pending: ConsequenceTag[],
  tag: ConsequenceTag,
): ConsequenceTag[] {
  return pending.filter((t) => t !== tag);
}

export function applyChoiceConsequences(
  pending: ConsequenceTag[],
  choice: EventChoice,
): ConsequenceTag[] {
  let next = pending;
  if (choice.consequenceTag) {
    next = addConsequenceTag(next, choice.consequenceTag);
  }
  if (choice.clearsConsequence) {
    next = removeConsequenceTag(next, choice.clearsConsequence);
  }
  return next;
}

export function eventMatchesDelayed(
  event: GameEvent,
  state: Pick<
    GameState,
    | 'pendingConsequences'
    | 'relationshipStatus'
    | 'hasChildren'
    | 'childrenCount'
    | 'relationshipStartedAt'
    | 'time'
  >,
): boolean {
  if (event.requiresConsequence) {
    if (!state.pendingConsequences.includes(event.requiresConsequence)) {
      return false;
    }
  }
  if (event.requiresChildren && !state.hasChildren) return false;
  if (event.requiresNoChildren && state.hasChildren) return false;
  if (event.minRelationshipMonths && state.relationshipStartedAt) {
    const months =
      (state.time.age - state.relationshipStartedAt.age) * 12 +
      (state.time.month - state.relationshipStartedAt.month);
    if (months < event.minRelationshipMonths) return false;
  } else if (event.minRelationshipMonths) {
    return false;
  }
  return true;
}

export function hasPendingDelayedEvents(
  state: Pick<GameState, 'pendingConsequences'>,
): boolean {
  return state.pendingConsequences.length > 0;
}
