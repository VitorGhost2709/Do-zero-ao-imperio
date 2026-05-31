import type { EventChoice, GameEvent, GameState } from '../types/game';
import { applyEventChoiceToState } from './eventEffects';
import { applyChoiceConsequences } from './delayedConsequenceLogic';
import { applyChildrenFromChoice } from './familyLogic';
import { addDiaryMilestone, applyDiaryChecks } from './lifeDiaryLogic';
import { mergeMemoryUnlocks } from './memoryLogic';
import { applyPartnerStatusChange } from './partnerLogic';

export function applyEventChoiceNarrative(
  state: GameState,
  _event: GameEvent,
  choice: EventChoice,
): Pick<
  GameState,
  | 'stats'
  | 'relationshipStatus'
  | 'relationshipScore'
  | 'fame'
  | 'partnerName'
  | 'exPartnerName'
  | 'relationshipStartedAt'
  | 'pendingConsequences'
  | 'unlockedMemories'
  | 'hasChildren'
  | 'childrenCount'
  | 'lifeDiary'
> {
  const applied = applyEventChoiceToState(state, choice);
  const prevStatus = state.relationshipStatus;
  const newStatus = applied.relationshipStatus;

  const partner = applyPartnerStatusChange(
    prevStatus,
    newStatus,
    state.partnerName,
    state.exPartnerName,
    state.time,
    state.relationshipStartedAt,
  );

  let pendingConsequences = applyChoiceConsequences(
    state.pendingConsequences,
    choice,
  );

  let unlockedMemories = state.unlockedMemories;
  if (choice.memoryId) {
    unlockedMemories = mergeMemoryUnlocks(unlockedMemories, [choice.memoryId]);
  }
  if (newStatus === 'married' && prevStatus !== 'married') {
    unlockedMemories = mergeMemoryUnlocks(unlockedMemories, ['happy_marriage']);
  }
  if (newStatus === 'separated' || (newStatus === 'single' && prevStatus !== 'single')) {
    unlockedMemories = mergeMemoryUnlocks(unlockedMemories, ['painful_breakup']);
  }

  const children = applyChildrenFromChoice(
    state.hasChildren,
    state.childrenCount,
    choice.hasChildren,
    choice.childrenDelta,
  );

  let lifeDiary = applyDiaryChecks(
    {
      ...state,
      relationshipStatus: newStatus,
      partnerName: partner.partnerName,
    },
    {
      prevRelationshipStatus: prevStatus,
      newRelationshipStatus: newStatus,
      moneyDelta: choice.effects.money,
    },
  );

  if (choice.diaryMilestoneId) {
    lifeDiary = addDiaryMilestone(
      lifeDiary,
      choice.diaryMilestoneId,
      state.time,
      partner.partnerName ?? state.partnerName,
    );
  }

  return {
    stats: applied.stats,
    relationshipStatus: newStatus,
    relationshipScore: applied.relationshipScore,
    fame: applied.fame,
    partnerName: partner.partnerName,
    exPartnerName: partner.exPartnerName,
    relationshipStartedAt: partner.relationshipStartedAt,
    pendingConsequences,
    unlockedMemories,
    hasChildren: children.hasChildren,
    childrenCount: children.childrenCount,
    lifeDiary,
  };
}
