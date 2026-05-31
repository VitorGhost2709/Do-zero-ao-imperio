import type { DifficultyId, GameState, LifePathId } from './game';

export type SaveSyncStatus =
  | 'local_only'
  | 'synced'
  | 'dirty'
  | 'syncing'
  | 'error';

export interface SaveMetadata {
  characterName: string;
  currentAge: number;
  currentMoney: number;
  patrimony: number;
  lifePath: LifePathId;
  difficulty: DifficultyId;
  isGameOver: boolean;
}

export interface CloudSaveSummary {
  id: string;
  name: string;
  slot: number;
  characterName: string | null;
  currentAge: number | null;
  currentMoney: number | null;
  patrimony: number | null;
  lifePath: string | null;
  difficulty: string | null;
  isGameOver: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CloudSaveRecord extends CloudSaveSummary {
  saveData: GameState;
}

export interface LocalCloudMeta {
  activeCloudSaveId?: string;
  lastCloudSyncAt?: string;
  cloudSyncStatus: SaveSyncStatus;
}

export interface CloudServiceError {
  message: string;
  code?: string;
}
