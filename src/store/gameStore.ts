import { create } from 'zustand';
import { ACTION_MAP } from '../data/actions';
import { BUSINESS_MAP } from '../data/businesses';
import { UPGRADES } from '../data/upgrades';
import type {
  ActionId,
  DifficultyId,
  GameEvent,
  HistoryEntry,
  OriginId,
  TraitId,
} from '../types/game';
import type { GameState } from '../types/game';
import { DEBT_THRESHOLD } from '../types/game';
import type { SaveSyncStatus } from '../types/save';
import {
  checkAchievements,
  updateTracking,
} from '../utils/achievementLogic';
import {
  canPromoteToCareer,
  getCareer,
} from '../utils/careerLogic';
import {
  canPurchaseBusiness,
  canUpgradeBusiness,
} from '../utils/businessLogic';
import { enrichGameOver } from '../utils/biographyLogic';
import { pickRandomEvent } from '../utils/eventLogic';
import {
  applyDiaryChecks,
  type DiaryCheckContext,
} from '../utils/lifeDiaryLogic';
import {
  checkAutomaticMemories,
  mergeMemoryUnlocks,
} from '../utils/memoryLogic';
import { applyEventChoiceNarrative } from '../utils/narrativeProgression';
import { applyPartnerStatusChange } from '../utils/partnerLogic';
import {
  clampRelationshipScore,
  getSocializeRelationshipBonus,
} from '../utils/relationshipLogic';
import { updateFameFromAction, addFame } from '../utils/fameLogic';
import {
  getDominantLifePath,
  updateLifePathFromAction,
  updateLifePathFromCareerChange,
  updateLifePathFromBusiness,
} from '../utils/lifePathLogic';
import {
  canPurchaseHousing,
  canRentHousing,
  getHousing,
} from '../utils/housingLogic';
import {
  checkObjectives,
  rewardToStatDelta,
} from '../utils/objectiveLogic';
import { createGameStateFromProfile } from '../utils/profileLogic';
import { canRetire } from '../utils/retirementLogic';
import {
  advanceTime,
  applyDebtPenalties,
  applyStatDelta,
  buildActionHistoryMessage,
  buildBusinessPurchaseMessage,
  buildBusinessUpgradeMessage,
  buildCareerChangeMessage,
  buildEventHistoryMessage,
  buildHousingMoveMessage,
  buildHousingPurchaseMessage,
  buildHousingRentMessage,
  buildRetirementGameOver,
  buildUpgradeHistoryMessage,
  checkConsequences,
  computeActionEffects,
  formatHistoryLine,
  shouldIncrementExhaustion,
  shouldTriggerEvent,
  type GameOverProfile,
} from '../utils/gameLogic';
import { processMonthlyCycle } from '../utils/monthlyLogic';
import {
  buildActionBreakdown,
  buildLastMonthSummary,
} from '../utils/monthSummaryLogic';
import type { MonthBreakdownItem, TurnSnapshot } from '../types/monthSummary';
import { useNotificationStore } from './notificationStore';
import {
  clearCloudMeta,
  clearSavedGame,
  getDefaultGameState,
  getPatrimonyContext,
  loadCloudMeta,
  loadGameState,
  saveCloudMeta,
  saveGameState,
} from '../utils/storage';
import { serializeGameState, suggestCloudSaveName } from '../utils/saveSerialization';
import {
  createCloudSave,
  loadCloudSave,
  updateCloudSave,
} from '../services/cloudSaveService';

interface GameStore extends GameState {
  activeCloudSaveId?: string;
  lastCloudSyncAt?: string;
  cloudSyncStatus: SaveSyncStatus;
  performAction: (actionId: ActionId) => void;
  purchaseUpgrade: (upgradeId: string) => void;
  resolveEventChoice: (choiceId: string) => void;
  changeCareer: (careerId: string) => void;
  rentHousing: (housingId: string) => void;
  purchaseHousing: (housingId: string) => void;
  moveToHousing: (housingId: string) => void;
  purchaseBusiness: (businessId: string) => void;
  upgradeBusiness: (businessId: string) => void;
  retireCharacter: () => void;
  createCharacter: (
    name: string,
    originId: OriginId,
    traitId: TraitId,
    difficultyId: DifficultyId,
  ) => void;
  resetGame: () => void;
  hydrate: () => void;
  saveToCloud: () => Promise<{ ok: boolean; message?: string }>;
  loadFromCloud: (saveId: string) => Promise<{ ok: boolean; message?: string }>;
  uploadLocalToCloud: (
    name?: string,
  ) => Promise<{ ok: boolean; message?: string; saveId?: string }>;
  setCloudTracking: (
    saveId: string | undefined,
    status: SaveSyncStatus,
    syncedAt?: string,
  ) => void;
  detachCloudSave: () => void;
  dismissMonthTransition: () => void;
}

function captureTurnSnapshot(
  state: Pick<GameState, 'stats' | 'fame' | 'relationshipScore'>,
): TurnSnapshot {
  return {
    stats: { ...state.stats },
    fame: state.fame,
    relationshipScore: state.relationshipScore,
  };
}

function addHistory(
  history: HistoryEntry[],
  message: string,
): HistoryEntry[] {
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    message,
    timestamp: Date.now(),
  };
  return [entry, ...history].slice(0, 80);
}

function getGameOverProfile(state: GameState): GameOverProfile {
  return {
    characterName: state.characterName,
    originId: state.originId,
    traitId: state.traitId,
    difficultyId: state.difficultyId,
    dominantLifePathId: getDominantLifePath(state.lifePathTracking),
    currentCareerId: state.currentCareerId,
    ownedBusinessIds: state.ownedBusinessIds,
    unlockedAchievementIds: state.unlockedAchievementIds,
    fame: state.fame,
    relationshipStatus: state.relationshipStatus,
  };
}

function withNarrativeLayer(
  state: GameState,
  patch: Partial<GameState>,
  diaryCtx?: DiaryCheckContext,
): Partial<GameState> & { lifeDiary: GameState['lifeDiary']; unlockedMemories: GameState['unlockedMemories'] } {
  const merged = { ...state, ...patch, lifeDiary: patch.lifeDiary ?? state.lifeDiary };
  let lifeDiary = merged.lifeDiary;
  if (diaryCtx) {
    lifeDiary = applyDiaryChecks(merged, diaryCtx);
  }
  const autoMemories = checkAutomaticMemories(merged);
  const unlockedMemories = mergeMemoryUnlocks(
    merged.unlockedMemories,
    autoMemories,
  );
  return { ...patch, lifeDiary, unlockedMemories };
}

function resolveCloudStatusAfterLocalSave(
  state: Pick<GameStore, 'activeCloudSaveId' | 'cloudSyncStatus'>,
): SaveSyncStatus {
  if (!state.activeCloudSaveId) return 'local_only';
  if (state.cloudSyncStatus === 'syncing') return 'syncing';
  return 'dirty';
}

function persist(state: GameStore, forceStatus?: SaveSyncStatus): SaveSyncStatus {
  saveGameState(serializeGameState(state));
  const cloudSyncStatus =
    forceStatus ?? resolveCloudStatusAfterLocalSave(state);
  saveCloudMeta({
    activeCloudSaveId: state.activeCloudSaveId,
    lastCloudSyncAt: state.lastCloudSyncAt,
    cloudSyncStatus,
  });
  return cloudSyncStatus;
}

function persistStore(state: GameStore, forceStatus?: SaveSyncStatus): SaveSyncStatus {
  return persist(state, forceStatus);
}

function applyProgression(
  state: GameState,
): Pick<
  GameState,
  | 'stats'
  | 'history'
  | 'lifeDiary'
  | 'completedObjectiveIds'
  | 'unlockedAchievementIds'
  | 'achievementUnlockMeta'
> {
  const push = useNotificationStore.getState().push;
  let stats = state.stats;
  let history = state.history;
  let completedObjectiveIds = [...state.completedObjectiveIds];
  let unlockedAchievementIds = [...state.unlockedAchievementIds];
  let achievementUnlockMeta = { ...state.achievementUnlockMeta };

  const { newlyCompleted } = checkObjectives(state);
  let lifeDiary = state.lifeDiary;
  newlyCompleted.forEach((obj) => {
    stats = applyStatDelta(stats, rewardToStatDelta(obj.reward));
    completedObjectiveIds.push(obj.id);
    lifeDiary = applyDiaryChecks(
      { ...state, stats, lifeDiary },
      { completedObjective: true },
    );
    history = addHistory(
      history,
      formatHistoryLine(state.time, `objetivo: ${obj.title}.`),
    );
    push('objective', 'Objetivo concluído!', obj.title);
  });

  const mergedForAchievements = {
    ...state,
    stats,
    completedObjectiveIds,
    unlockedAchievementIds,
  };
  const { newlyUnlocked } = checkAchievements(mergedForAchievements);
  newlyUnlocked.forEach((ach) => {
    stats = applyStatDelta(stats, rewardToStatDelta(ach.reward));
    unlockedAchievementIds.push(ach.id);
    achievementUnlockMeta[ach.id] = {
      age: state.time.age,
      month: state.time.month,
    };
    history = addHistory(
      history,
      formatHistoryLine(state.time, `conquista: ${ach.title}.`),
    );
    const extra =
      state.difficultyId === 'survival'
        ? { reputation: 5, happiness: 4 }
        : {};
    if (Object.keys(extra).length > 0) {
      stats = applyStatDelta(stats, extra);
    }
    push('achievement', 'Conquista!', ach.title);
  });

  return {
    stats,
    history,
    lifeDiary,
    completedObjectiveIds,
    unlockedAchievementIds,
    achievementUnlockMeta,
  };
}

function finalizeTurn(
  state: GameStore,
  stats: GameState['stats'],
  time: GameState['time'],
  historyMessages: string[],
  actionsSinceLastEvent: number,
  exhaustionCounter: number,
  tracking: GameState['tracking'],
): Partial<GameStore> {
  const push = useNotificationStore.getState().push;
  let newStats = stats;
  let newTime = time;
  let history = state.history;
  let newExhaustion = exhaustionCounter;
  let newTracking = tracking;
  const assets = getPatrimonyContext(state);
  const profile = getGameOverProfile(state);

  if (newStats.stress >= 85 || newStats.mentalHealth <= 20) {
    push('warning', 'Alerta', 'Você está perto de um colapso.');
  }

  historyMessages.forEach((msg) => {
    history = addHistory(history, msg);
  });

  const debt = applyDebtPenalties(newStats, newTime);
  newStats = debt.stats;
  if (debt.message) history = addHistory(history, debt.message);

  const consequences = checkConsequences(
    newStats,
    newTime,
    newExhaustion,
    assets,
    state.totalActions + 1,
    profile,
    state.traitId,
    state.difficultyId,
  );
  newStats = consequences.stats;
  newTime = consequences.time;
  newExhaustion = consequences.exhaustionCounter;
  let diaryPatch: Partial<GameState> = {};
  consequences.historyMessages.forEach((msg) => {
    history = addHistory(history, msg);
    if (msg.includes('CRISE') || msg.includes('BURNOUT')) {
      push('crisis', 'Crise!', 'Sua saúde precisa de atenção urgente.');
    }
    if (msg.includes('BURNOUT')) {
      newTracking = { ...newTracking, hadBurnout: true };
      diaryPatch = withNarrativeLayer(
        { ...state, stats: newStats, time: newTime, tracking: newTracking },
        {},
        { hadBurnout: true },
      );
    }
  });

  if (consequences.gameOver) {
    const mergedState = {
      ...state,
      stats: newStats,
      time: newTime,
      tracking: newTracking,
    };
    const gameOverType =
      consequences.gameOver.type === 'retirement'
        ? 'retirement'
        : consequences.gameOver.type === 'mental_collapse'
          ? 'mental_collapse'
          : 'death';
    const narrativePatch = withNarrativeLayer(mergedState, {}, {
      hadBurnout: newTracking.hadBurnout,
      hadNearDeath: newTracking.hadNearDeath,
      gameOverType,
    });
    const enriched = enrichGameOver(consequences.gameOver, {
      ...mergedState,
      ...narrativePatch,
    } as GameState);
    const next: Partial<GameStore> = {
      stats: newStats,
      time: newTime,
      history,
      gameOver: enriched,
      activeEvent: null,
      exhaustionCounter: newExhaustion,
      tracking: newTracking,
      lifeDiary: narrativePatch.lifeDiary,
      unlockedMemories: narrativePatch.unlockedMemories,
    };
    const cloudSyncStatus = persistStore({ ...state, ...next } as GameStore);
    return { ...next, cloudSyncStatus };
  }

  let newActionsSince = actionsSinceLastEvent;
  let activeEvent: GameEvent | null = null;

  if (shouldTriggerEvent(newActionsSince) && !state.isRetired) {
    activeEvent = pickRandomEvent({
      ...state,
      stats: newStats,
      time: newTime,
    });
    newActionsSince = 0;
  }

  let next: Partial<GameStore> = {
    stats: newStats,
    time: newTime,
    history,
    actionsSinceLastEvent: newActionsSince,
    activeEvent,
    gameOver: null,
    exhaustionCounter: newExhaustion,
    tracking: newTracking,
    ...diaryPatch,
  };

  const progression = applyProgression({ ...state, ...next } as GameState);
  next = { ...next, ...progression };

  const cloudSyncStatus = persistStore({ ...state, ...next } as GameStore);
  return { ...next, cloudSyncStatus };
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...getDefaultGameState(),
  activeCloudSaveId: undefined,
  lastCloudSyncAt: undefined,
  cloudSyncStatus: 'local_only',

  hydrate: () => {
    const cloudMeta = loadCloudMeta();
    const saved = loadGameState();
    if (saved) {
      set({
        ...saved,
        activeEvent: null,
        activeCloudSaveId: cloudMeta.activeCloudSaveId,
        lastCloudSyncAt: cloudMeta.lastCloudSyncAt,
        cloudSyncStatus: cloudMeta.cloudSyncStatus,
      });
    } else {
      set({
        ...getDefaultGameState(),
        activeCloudSaveId: cloudMeta.activeCloudSaveId,
        lastCloudSyncAt: cloudMeta.lastCloudSyncAt,
        cloudSyncStatus: cloudMeta.cloudSyncStatus,
      });
    }
  },

  createCharacter: (name, originId, traitId, difficultyId) => {
    const newState = createGameStateFromProfile(
      name,
      originId,
      traitId,
      difficultyId,
    );
    set(newState);
    const cloudSyncStatus = persist({ ...get(), ...newState } as GameStore);
    set({ cloudSyncStatus });
  },

  dismissMonthTransition: () => set({ monthTransition: null }),

  performAction: (actionId) => {
    const state = get();
    if (
      !state.profileComplete ||
      state.gameOver ||
      state.activeEvent ||
      state.isRetired
    ) {
      return;
    }

    const beforeTime = { ...state.time };
    const beforeSnapshot = captureTurnSnapshot(state);

    const energyBefore = state.stats.energy;
    let exhaustionCounter = state.exhaustionCounter;
    if (shouldIncrementExhaustion(actionId, energyBefore)) {
      exhaustionCounter += 1;
    }

    const { effects, flags } = computeActionEffects(
      actionId,
      state.purchasedUpgrades,
      state.stats,
      state.currentCareerId,
      state.currentHousingId,
      state.traitId,
      state.difficultyId,
    );
    let newStats = applyStatDelta(state.stats, effects);
    const newTime = advanceTime(state.time);

    let lifePathTracking = updateLifePathFromAction(
      state.lifePathTracking,
      actionId,
      { stats: newStats, currentCareerId: state.currentCareerId },
    );
    let relationshipScore = state.relationshipScore;
    let relationshipStatus = state.relationshipStatus;
    let fame = state.fame;

    if (actionId === 'socialize') {
      const bonus = getSocializeRelationshipBonus(relationshipStatus);
      relationshipScore = clampRelationshipScore(
        relationshipScore + bonus.score,
      );
      fame = updateFameFromAction(fame, 'socialize', newStats);
    }
    if (actionId === 'invest') {
      lifePathTracking = {
        ...lifePathTracking,
        investments: lifePathTracking.investments + 2,
      };
    }

    const monthly = processMonthlyCycle(
      {
        stats: newStats,
        currentHousingId: state.currentHousingId,
        ownedBusinessIds: state.ownedBusinessIds,
        businessLevels: state.businessLevels,
        difficultyId: state.difficultyId,
        relationshipStatus,
        relationshipScore,
        fame,
        hasChildren: state.hasChildren,
        childrenCount: state.childrenCount,
      },
      newTime,
    );
    newStats = monthly.stats;
    relationshipStatus = monthly.relationshipStatus;
    relationshipScore = monthly.relationshipScore;
    fame = monthly.fame;

    let tracking = updateTracking(state, actionId, {
      investGain: flags.investGain,
      burnout: false,
    });
    if (newStats.physicalHealth <= 15) tracking.hadNearDeath = true;
    if (newStats.money < -300) {
      tracking.hadHeavyDebt = true;
      tracking.wasInHeavyDebt = true;
    }

    const action = ACTION_MAP[actionId];
    const monthBreakdown: MonthBreakdownItem[] = [
      ...buildActionBreakdown(action, effects),
      ...monthly.breakdown,
    ];
    const historyMsg = buildActionHistoryMessage(
      action,
      effects,
      newTime,
      flags,
    );

    let relStatusAfter = monthly.relationshipStatus;
    let relScoreAfter = monthly.relationshipScore;

    const partnerTransition = applyPartnerStatusChange(
      state.relationshipStatus,
      relStatusAfter,
      state.partnerName,
      state.exPartnerName,
      newTime,
      state.relationshipStartedAt,
    );

    const narrativePatch = withNarrativeLayer(
      {
        ...state,
        stats: newStats,
        relationshipStatus: relStatusAfter,
        relationshipScore: relScoreAfter,
        partnerName: partnerTransition.partnerName,
        exPartnerName: partnerTransition.exPartnerName,
        relationshipStartedAt: partnerTransition.relationshipStartedAt,
      },
      {},
      {
        prevRelationshipStatus: state.relationshipStatus,
        newRelationshipStatus: relStatusAfter,
        hadNearDeath: tracking.hadNearDeath,
      },
    );

    const partial = finalizeTurn(
      state,
      newStats,
      newTime,
      [historyMsg, ...monthly.messages],
      state.actionsSinceLastEvent + 1,
      exhaustionCounter,
      tracking,
    );

    const finalStats = partial.stats ?? newStats;
    const afterSnapshot = captureTurnSnapshot({
      stats: finalStats,
      fame: monthly.fame,
      relationshipScore: relScoreAfter,
    });

    if (finalStats.money < DEBT_THRESHOLD) {
      monthBreakdown.push({
        label: 'Dívidas: +4 estresse e queda de humor/reputação',
        type: 'warning',
      });
    }

    const lastMonthSummary = buildLastMonthSummary({
      before: beforeSnapshot,
      after: afterSnapshot,
      beforeTime,
      afterTime: newTime,
      actionName: action.name,
      breakdown: monthBreakdown,
    });

    set({
      ...partial,
      lifePathTracking,
      relationshipStatus: relStatusAfter,
      relationshipScore: relScoreAfter,
      fame: monthly.fame,
      partnerName: partnerTransition.partnerName,
      exPartnerName: partnerTransition.exPartnerName,
      relationshipStartedAt: partnerTransition.relationshipStartedAt,
      lifeDiary: narrativePatch.lifeDiary ?? partial.lifeDiary,
      unlockedMemories: narrativePatch.unlockedMemories,
      totalActions: state.totalActions + 1,
      lastMonthSummary,
      monthTransition: {
        id: crypto.randomUUID(),
        fromMonth: beforeTime.month,
        toMonth: newTime.month,
        fromAge: beforeTime.age,
        toAge: newTime.age,
      },
    });
  },

  purchaseUpgrade: (upgradeId) => {
    const state = get();
    if (state.gameOver) return;

    const upgrade = UPGRADES.find((u) => u.id === upgradeId);
    if (!upgrade) return;
    if (state.purchasedUpgrades.includes(upgradeId)) return;
    if (state.stats.money < upgrade.cost) return;

    const newStats = applyStatDelta(state.stats, { money: -upgrade.cost });
    let history = addHistory(
      state.history,
      buildUpgradeHistoryMessage(upgrade.name, state.time),
    );

    const progression = applyProgression({
      ...state,
      stats: newStats,
      history,
      purchasedUpgrades: [...state.purchasedUpgrades, upgradeId],
    });

    const next = {
      stats: progression.stats ?? newStats,
      history: progression.history ?? history,
      purchasedUpgrades: [...state.purchasedUpgrades, upgradeId],
      completedObjectiveIds: progression.completedObjectiveIds,
      unlockedAchievementIds: progression.unlockedAchievementIds,
      achievementUnlockMeta: progression.achievementUnlockMeta,
    };
    const cloudSyncStatus = persistStore({ ...get(), ...next } as GameStore);
    set({ ...next, cloudSyncStatus });
  },

  changeCareer: (careerId) => {
    const state = get();
    if (state.gameOver || state.activeEvent) return;

    const check = canPromoteToCareer(
      state.stats,
      careerId,
      state.currentCareerId,
      state.traitId,
    );
    if (!check.ok) return;

    const career = getCareer(careerId);
    const newStats = applyStatDelta(state.stats, { money: -career.entryCost });
    let history = addHistory(
      state.history,
      buildCareerChangeMessage(
        career.name,
        state.time,
        career.perkDescription,
      ),
    );

    useNotificationStore
      .getState()
      .push('promotion', 'Promoção!', `Você agora é ${career.name}.`);

    const lifePathTracking = updateLifePathFromCareerChange(
      state.lifePathTracking,
      careerId,
    );

    const progression = applyProgression({
      ...state,
      stats: newStats,
      history,
      currentCareerId: careerId,
      lifePathTracking,
    });

    const narrativePatch = withNarrativeLayer(
      { ...state, currentCareerId: careerId },
      {},
      {
        prevCareerId: state.currentCareerId,
        newCareerId: careerId,
      },
    );

    const next = {
      stats: progression.stats ?? newStats,
      history: progression.history ?? history,
      currentCareerId: careerId,
      lifePathTracking,
      lifeDiary: narrativePatch.lifeDiary,
      unlockedMemories: narrativePatch.unlockedMemories,
      completedObjectiveIds: progression.completedObjectiveIds,
      unlockedAchievementIds: progression.unlockedAchievementIds,
      achievementUnlockMeta: progression.achievementUnlockMeta,
    };
    set(next);
    const cloudSyncStatus = persistStore({ ...get(), ...next } as GameStore);
    set({ cloudSyncStatus });
  },

  rentHousing: (housingId) => {
    const state = get();
    if (state.gameOver) return;
    if (!canRentHousing(state.stats, housingId).ok) return;

    const housing = getHousing(housingId);
    const history = addHistory(
      state.history,
      buildHousingRentMessage(housing.name, state.time),
    );
    const narrativePatch = withNarrativeLayer(
      { ...state, currentHousingId: housingId },
      {},
      {
        prevHousingId: state.currentHousingId,
        newHousingId: housingId,
      },
    );
    const next = {
      currentHousingId: housingId,
      history,
      lifeDiary: narrativePatch.lifeDiary,
    };
    const cloudSyncStatus = persistStore({ ...get(), ...next } as GameStore);
    set({ ...next, cloudSyncStatus });
  },

  purchaseHousing: (housingId) => {
    const state = get();
    if (state.gameOver) return;
    if (!canPurchaseHousing(state.stats, housingId, state.ownedHousingIds).ok)
      return;

    const housing = getHousing(housingId);
    let newStats = applyStatDelta(state.stats, { money: -housing.purchaseCost });
    let history = addHistory(
      state.history,
      buildHousingPurchaseMessage(housing.name, state.time),
    );

    const progression = applyProgression({
      ...state,
      stats: newStats,
      history,
      currentHousingId: housingId,
      ownedHousingIds: [...state.ownedHousingIds, housingId],
    });

    const narrativePatch = withNarrativeLayer(
      {
        ...state,
        currentHousingId: housingId,
        ownedHousingIds: [...state.ownedHousingIds, housingId],
      },
      {},
      {
        prevHousingId: state.currentHousingId,
        newHousingId: housingId,
      },
    );

    const next = {
      stats: progression.stats ?? newStats,
      history: progression.history ?? history,
      currentHousingId: housingId,
      ownedHousingIds: [...state.ownedHousingIds, housingId],
      lifeDiary: narrativePatch.lifeDiary,
      unlockedMemories: narrativePatch.unlockedMemories,
      completedObjectiveIds: progression.completedObjectiveIds,
      unlockedAchievementIds: progression.unlockedAchievementIds,
      achievementUnlockMeta: progression.achievementUnlockMeta,
    };
    const cloudSyncStatus = persistStore({ ...get(), ...next } as GameStore);
    set({ ...next, cloudSyncStatus });
  },

  moveToHousing: (housingId) => {
    const state = get();
    if (state.gameOver) return;
    const housing = getHousing(housingId);
    if (
      housing.type === 'owned' &&
      !state.ownedHousingIds.includes(housingId)
    ) {
      return;
    }

    const history = addHistory(
      state.history,
      buildHousingMoveMessage(housing.name, state.time),
    );
    const next = { currentHousingId: housingId, history };
    const cloudSyncStatus = persistStore({ ...get(), ...next } as GameStore);
    set({ ...next, cloudSyncStatus });
  },

  purchaseBusiness: (businessId) => {
    const state = get();
    if (state.gameOver) return;
    if (!canPurchaseBusiness(state.stats, businessId, state.ownedBusinessIds).ok)
      return;

    const biz = BUSINESS_MAP[businessId];
    if (!biz) return;

    let newStats = applyStatDelta(state.stats, { money: -biz.cost });
    const businessLevels = {
      ...state.businessLevels,
      [businessId]: 1,
    };
    let history = addHistory(
      state.history,
      buildBusinessPurchaseMessage(biz.name, state.time),
    );

    useNotificationStore
      .getState()
      .push('business', 'Novo negócio!', `Você comprou ${biz.name}.`);

    const lifePathTracking = updateLifePathFromBusiness(
      state.lifePathTracking,
      false,
    );
    const fame = addFame(state.fame, 4);

    const progression = applyProgression({
      ...state,
      stats: newStats,
      history,
      ownedBusinessIds: [...state.ownedBusinessIds, businessId],
      businessLevels,
      lifePathTracking,
      fame,
    });

    const narrativePatch = withNarrativeLayer(
      {
        ...state,
        ownedBusinessIds: [...state.ownedBusinessIds, businessId],
      },
      {
        unlockedMemories: mergeMemoryUnlocks(state.unlockedMemories, [
          'life_changing_business',
        ]),
      },
      {
        prevBusinessCount: state.ownedBusinessIds.length,
        newBusinessCount: state.ownedBusinessIds.length + 1,
      },
    );

    const next = {
      stats: progression.stats ?? newStats,
      history: progression.history ?? history,
      ownedBusinessIds: [...state.ownedBusinessIds, businessId],
      businessLevels,
      lifePathTracking,
      fame,
      lifeDiary: narrativePatch.lifeDiary,
      unlockedMemories: narrativePatch.unlockedMemories,
      completedObjectiveIds: progression.completedObjectiveIds,
      unlockedAchievementIds: progression.unlockedAchievementIds,
      achievementUnlockMeta: progression.achievementUnlockMeta,
    };
    const cloudSyncStatus = persistStore({ ...get(), ...next } as GameStore);
    set({ ...next, cloudSyncStatus });
  },

  upgradeBusiness: (businessId) => {
    const state = get();
    if (state.gameOver || state.activeEvent) return;

    const check = canUpgradeBusiness(
      state.stats,
      businessId,
      state.ownedBusinessIds,
      state.businessLevels,
    );
    if (!check.ok || check.cost === undefined || !check.nextLevel) return;

    const biz = BUSINESS_MAP[businessId];
    if (!biz) return;

    const newStats = applyStatDelta(state.stats, { money: -check.cost });
    const businessLevels = {
      ...state.businessLevels,
      [businessId]: check.nextLevel,
    };
    let history = addHistory(
      state.history,
      buildBusinessUpgradeMessage(biz.name, check.nextLevel, state.time),
    );

    useNotificationStore
      .getState()
      .push('business', 'Negócio evoluiu!', `${biz.name} nível ${check.nextLevel}`);

    const lifePathTracking = updateLifePathFromBusiness(
      state.lifePathTracking,
      true,
    );

    const progression = applyProgression({
      ...state,
      stats: newStats,
      history,
      businessLevels,
      lifePathTracking,
    });

    const next = {
      stats: progression.stats ?? newStats,
      history: progression.history ?? history,
      businessLevels,
      lifePathTracking,
      completedObjectiveIds: progression.completedObjectiveIds,
      unlockedAchievementIds: progression.unlockedAchievementIds,
      achievementUnlockMeta: progression.achievementUnlockMeta,
    };
    const cloudSyncStatus = persistStore({ ...get(), ...next } as GameStore);
    set({ ...next, cloudSyncStatus });
  },

  retireCharacter: () => {
    const state = get();
    if (!canRetire(state)) return;

    const baseOver = buildRetirementGameOver(state, state.totalActions);
    const narrativePatch = withNarrativeLayer(state, {}, {
      gameOverType: 'retirement',
    });
    const gameOver = enrichGameOver(baseOver, {
      ...state,
      ...narrativePatch,
    } as GameState);
    const next = {
      isRetired: true,
      gameOver,
      activeEvent: null,
      lifeDiary: narrativePatch.lifeDiary,
      unlockedMemories: narrativePatch.unlockedMemories,
    };
    const cloudSyncStatus = persistStore({ ...state, ...next } as GameStore);
    set({ ...next, cloudSyncStatus });
  },

  resolveEventChoice: (choiceId) => {
    const state = get();
    const event = state.activeEvent;
    if (!event || state.gameOver) return;

    const choice = event.choices.find((c) => c.id === choiceId);
    if (!choice) return;

    const narrative = applyEventChoiceNarrative(state, event, choice);
    const narrativeMsg = buildEventHistoryMessage(
      choice.historyMessage,
      state.time,
    );

    const partial = finalizeTurn(
      state,
      narrative.stats,
      state.time,
      [narrativeMsg],
      state.actionsSinceLastEvent,
      state.exhaustionCounter,
      state.tracking,
    );

    set({
      ...partial,
      stats: narrative.stats,
      relationshipStatus: narrative.relationshipStatus,
      relationshipScore: narrative.relationshipScore,
      fame: narrative.fame,
      partnerName: narrative.partnerName,
      exPartnerName: narrative.exPartnerName,
      relationshipStartedAt: narrative.relationshipStartedAt,
      pendingConsequences: narrative.pendingConsequences,
      unlockedMemories: narrative.unlockedMemories,
      hasChildren: narrative.hasChildren,
      childrenCount: narrative.childrenCount,
      lifeDiary: narrative.lifeDiary,
      activeEvent: null,
      totalActions: state.totalActions + 1,
    });
  },

  resetGame: () => {
    clearSavedGame();
    clearCloudMeta();
    set({
      ...getDefaultGameState(),
      activeCloudSaveId: undefined,
      lastCloudSyncAt: undefined,
      cloudSyncStatus: 'local_only',
    });
  },

  setCloudTracking: (saveId, status, syncedAt) => {
    const next = {
      activeCloudSaveId: saveId,
      cloudSyncStatus: status,
      lastCloudSyncAt: syncedAt ?? get().lastCloudSyncAt,
    };
    set(next);
    persist({ ...get(), ...next }, status);
  },

  detachCloudSave: () => {
    get().setCloudTracking(undefined, 'local_only', undefined);
  },

  saveToCloud: async () => {
    const state = get();
    if (!state.activeCloudSaveId) {
      return { ok: false, message: 'Nenhum save na nuvem selecionado.' };
    }
    set({ cloudSyncStatus: 'syncing' });
    try {
      await updateCloudSave(state.activeCloudSaveId, state);
      const syncedAt = new Date().toISOString();
      set({
        cloudSyncStatus: 'synced',
        lastCloudSyncAt: syncedAt,
      });
      persistStore({ ...get(), cloudSyncStatus: 'synced', lastCloudSyncAt: syncedAt }, 'synced');
      return { ok: true };
    } catch (err) {
      set({ cloudSyncStatus: 'error' });
      saveCloudMeta({
        activeCloudSaveId: state.activeCloudSaveId,
        cloudSyncStatus: 'error',
        lastCloudSyncAt: state.lastCloudSyncAt,
      });
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Falha ao salvar na nuvem.';
      return { ok: false, message };
    }
  },

  loadFromCloud: async (saveId) => {
    try {
      const record = await loadCloudSave(saveId);
      const syncedAt = new Date().toISOString();
      set({
        ...record.saveData,
        activeEvent: null,
        activeCloudSaveId: saveId,
        cloudSyncStatus: 'synced',
        lastCloudSyncAt: syncedAt,
      });
      persistStore(
        {
          ...get(),
          activeCloudSaveId: saveId,
          cloudSyncStatus: 'synced',
          lastCloudSyncAt: syncedAt,
        } as GameStore,
        'synced',
      );
      return { ok: true };
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Falha ao carregar save.';
      return { ok: false, message };
    }
  },

  uploadLocalToCloud: async (name) => {
    const state = get();
    if (!state.profileComplete) {
      return { ok: false, message: 'Crie um personagem antes de enviar.' };
    }
    set({ cloudSyncStatus: 'syncing' });
    try {
      const saveName = name?.trim() || suggestCloudSaveName(state);
      const created = await createCloudSave(saveName, state);
      const syncedAt = new Date().toISOString();
      set({
        activeCloudSaveId: created.id,
        cloudSyncStatus: 'synced',
        lastCloudSyncAt: syncedAt,
      });
      persistStore(
        { ...get(), cloudSyncStatus: 'synced', lastCloudSyncAt: syncedAt } as GameStore,
        'synced',
      );
      return { ok: true, saveId: created.id };
    } catch (err) {
      set({ cloudSyncStatus: 'error' });
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Falha ao enviar save.';
      return { ok: false, message };
    }
  },
}));
