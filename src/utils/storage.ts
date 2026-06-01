import { DEFAULT_DIFFICULTY_ID } from '../data/difficulties';
import type { LocalCloudMeta } from '../types/save';
import type { GameState, GameTracking } from '../types/game';
import {
  createDefaultLifePathTracking,
  DEFAULT_ORIGIN_ID,
  DEFAULT_TRAIT_ID,
  INITIAL_CAREER_ID,
  INITIAL_HOUSING_ID,
} from '../types/game';
import { createInitialStats, createInitialTime } from './gameLogic';
import { migrateGameState } from './saveMigration';

const STORAGE_KEY = 'do-zero-ao-imperio-save';
const CLOUD_META_KEY = 'do-zero-ao-imperio-cloud-meta';

export function createDefaultTracking(): GameTracking {
  return {
    workCount: 0,
    investWins: 0,
    hadBurnout: false,
    hadNearDeath: false,
    hadHeavyDebt: false,
    wasInHeavyDebt: false,
    workedOnce: false,
  };
}

export function getDefaultGameState(): GameState {
  const time = createInitialTime();
  return {
    stats: createInitialStats(),
    time,
    purchasedUpgrades: [],
    history: [],
    actionsSinceLastEvent: 0,
    activeEvent: null,
    gameOver: null,
    totalActions: 0,
    exhaustionCounter: 0,
    currentCareerId: INITIAL_CAREER_ID,
    currentHousingId: INITIAL_HOUSING_ID,
    ownedHousingIds: [INITIAL_HOUSING_ID],
    ownedBusinessIds: [],
    characterName: '',
    originId: DEFAULT_ORIGIN_ID,
    traitId: DEFAULT_TRAIT_ID,
    profileComplete: false,
    completedObjectiveIds: [],
    unlockedAchievementIds: [],
    achievementUnlockMeta: {},
    difficultyId: DEFAULT_DIFFICULTY_ID,
    businessLevels: {},
    isRetired: false,
    relationshipStatus: 'single',
    relationshipScore: 0,
    fame: 0,
    lifePathTracking: createDefaultLifePathTracking(),
    tracking: createDefaultTracking(),
    lifeDiary: [],
    hasChildren: false,
    childrenCount: 0,
    unlockedMemories: [],
    pendingConsequences: [],
    lastMonthSummary: null,
    monthTransition: null,
  };
}

export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.warn('Não foi possível salvar o progresso.');
  }
}

export function hasSavedGame(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export function migrateRawSaveData(parsed: Partial<GameState>): GameState | null {
  const migrated = migrateGameState(parsed);
  if (!migrated) return null;

  const gameOver = parsed.gameOver
    ? {
        ...parsed.gameOver,
        lifeClassification:
          parsed.gameOver.lifeClassification ?? 'common_worker',
        lifeClassificationLabel:
          parsed.gameOver.lifeClassificationLabel ?? 'Trabalhador comum',
        difficultyId: parsed.gameOver.difficultyId ?? DEFAULT_DIFFICULTY_ID,
        dominantLifePathId:
          parsed.gameOver.dominantLifePathId ?? 'balanced',
        biography:
          parsed.gameOver.biography ?? parsed.gameOver.lifeSummary ?? '',
        diaryHighlights: parsed.gameOver.diaryHighlights ?? [],
        positiveMemories: parsed.gameOver.positiveMemories ?? [],
        negativeMemories: parsed.gameOver.negativeMemories ?? [],
        relationshipStatus:
          parsed.gameOver.relationshipStatus ?? migrated.relationshipStatus,
        relationshipScore:
          parsed.gameOver.relationshipScore ?? migrated.relationshipScore,
        hasChildren: parsed.gameOver.hasChildren ?? migrated.hasChildren,
        childrenCount:
          parsed.gameOver.childrenCount ?? migrated.childrenCount,
        emotionalLegacy: parsed.gameOver.emotionalLegacy ?? '',
        financialLegacy: parsed.gameOver.financialLegacy ?? '',
        retirementMoodLabel: parsed.gameOver.retirementMoodLabel,
      }
    : null;

  return {
    ...migrated,
    gameOver,
    isRetired: migrated.isRetired || Boolean(gameOver),
    activeEvent: null,
  };
}

export function loadGameState(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GameState>;
    return migrateRawSaveData(parsed);
  } catch {
    return null;
  }
}

export function clearSavedGame(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getDefaultCloudMeta(): LocalCloudMeta {
  return { cloudSyncStatus: 'local_only' };
}

export function loadCloudMeta(): LocalCloudMeta {
  try {
    const raw = localStorage.getItem(CLOUD_META_KEY);
    if (!raw) return getDefaultCloudMeta();
    const parsed = JSON.parse(raw) as Partial<LocalCloudMeta>;
    return {
      activeCloudSaveId: parsed.activeCloudSaveId,
      lastCloudSyncAt: parsed.lastCloudSyncAt,
      cloudSyncStatus: parsed.cloudSyncStatus ?? 'local_only',
    };
  } catch {
    return getDefaultCloudMeta();
  }
}

export function saveCloudMeta(meta: LocalCloudMeta): void {
  try {
    localStorage.setItem(CLOUD_META_KEY, JSON.stringify(meta));
  } catch {
    console.warn('Não foi possível salvar metadados de nuvem.');
  }
}

export function clearCloudMeta(): void {
  localStorage.removeItem(CLOUD_META_KEY);
}

export function getPatrimonyContext(
  state: Pick<
    GameState,
    | 'purchasedUpgrades'
    | 'ownedHousingIds'
    | 'ownedBusinessIds'
    | 'businessLevels'
  >,
) {
  return {
    purchasedUpgrades: state.purchasedUpgrades,
    ownedHousingIds: state.ownedHousingIds,
    ownedBusinessIds: state.ownedBusinessIds,
    businessLevels: state.businessLevels ?? {},
  };
}
