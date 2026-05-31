import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import type { GameState } from '../types/game';
import type {
  CloudSaveRecord,
  CloudSaveSummary,
  CloudServiceError,
} from '../types/save';
import { buildSaveMetadata, serializeGameState } from '../utils/saveSerialization';
import { migrateRawSaveData } from '../utils/storage';

const MAX_SLOTS = 20;

type DbRow = {
  id: string;
  user_id: string;
  name: string;
  slot: number;
  save_data: unknown;
  character_name: string | null;
  current_age: number | null;
  current_money: number | null;
  patrimony: number | null;
  life_path: string | null;
  difficulty: string | null;
  is_game_over: boolean;
  created_at: string;
  updated_at: string;
};

function requireClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw toError(
      'Nuvem não configurada. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.',
      'NOT_CONFIGURED',
    );
  }
  return supabase;
}

function toError(message: string, code?: string): CloudServiceError {
  return { message, code };
}

function mapSupabaseError(err: { message?: string; code?: string }): CloudServiceError {
  const msg = err.message ?? 'Erro desconhecido ao acessar a nuvem.';
  if (msg.includes('JWT') || msg.includes('session')) {
    return toError('Sessão expirada. Entre novamente.', 'AUTH');
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return toError('Sem conexão. Tente novamente quando estiver online.', 'OFFLINE');
  }
  return toError(msg, err.code);
}

function rowToSummary(row: DbRow): CloudSaveSummary {
  return {
    id: row.id,
    name: row.name,
    slot: row.slot,
    characterName: row.character_name,
    currentAge: row.current_age,
    currentMoney: row.current_money,
    patrimony: row.patrimony,
    lifePath: row.life_path,
    difficulty: row.difficulty,
    isGameOver: row.is_game_over,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parseSaveData(raw: unknown): GameState {
  const parsed =
    typeof raw === 'string' ? (JSON.parse(raw) as Partial<GameState>) : (raw as Partial<GameState>);
  const migrated = migrateRawSaveData(parsed);
  if (!migrated) {
    throw toError('Save inválido ou corrompido.', 'INVALID_SAVE');
  }
  return migrated;
}

async function getUserId(): Promise<string> {
  const client = requireClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    throw toError('Você precisa estar logado.', 'AUTH');
  }
  return data.user.id;
}

async function nextAvailableSlot(userId: string): Promise<number> {
  const client = requireClient();
  const { data, error } = await client
    .from('game_saves')
    .select('slot')
    .eq('user_id', userId)
    .order('slot', { ascending: true });

  if (error) throw mapSupabaseError(error);

  const used = new Set((data ?? []).map((r: { slot: number }) => r.slot));
  for (let slot = 1; slot <= MAX_SLOTS; slot++) {
    if (!used.has(slot)) return slot;
  }
  throw toError(`Limite de ${MAX_SLOTS} saves na nuvem atingido.`, 'SLOT_LIMIT');
}

function buildDbPayload(name: string, slot: number, userId: string, state: GameState) {
  const serialized = serializeGameState(state);
  const meta = buildSaveMetadata(serialized);
  return {
    user_id: userId,
    name,
    slot,
    save_data: serialized,
    character_name: meta.characterName,
    current_age: meta.currentAge,
    current_money: meta.currentMoney,
    patrimony: meta.patrimony,
    life_path: meta.lifePath,
    difficulty: meta.difficulty,
    is_game_over: meta.isGameOver,
  };
}

export async function listCloudSaves(): Promise<CloudSaveSummary[]> {
  const client = requireClient();
  const userId = await getUserId();

  const { data, error } = await client
    .from('game_saves')
    .select(
      'id, user_id, name, slot, character_name, current_age, current_money, patrimony, life_path, difficulty, is_game_over, created_at, updated_at',
    )
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw mapSupabaseError(error);
  return (data as DbRow[]).map(rowToSummary);
}

export async function createCloudSave(
  name: string,
  gameState: GameState,
): Promise<CloudSaveSummary> {
  const client = requireClient();
  const userId = await getUserId();
  const slot = await nextAvailableSlot(userId);

  const { data, error } = await client
    .from('game_saves')
    .insert(buildDbPayload(name, slot, userId, gameState))
    .select(
      'id, user_id, name, slot, character_name, current_age, current_money, patrimony, life_path, difficulty, is_game_over, created_at, updated_at',
    )
    .single();

  if (error) throw mapSupabaseError(error);
  return rowToSummary(data as DbRow);
}

export async function updateCloudSave(
  saveId: string,
  gameState: GameState,
): Promise<CloudSaveSummary> {
  const client = requireClient();
  const userId = await getUserId();
  const serialized = serializeGameState(gameState);
  const meta = buildSaveMetadata(serialized);

  const { data, error } = await client
    .from('game_saves')
    .update({
      save_data: serialized,
      character_name: meta.characterName,
      current_age: meta.currentAge,
      current_money: meta.currentMoney,
      patrimony: meta.patrimony,
      life_path: meta.lifePath,
      difficulty: meta.difficulty,
      is_game_over: meta.isGameOver,
    })
    .eq('id', saveId)
    .eq('user_id', userId)
    .select(
      'id, user_id, name, slot, character_name, current_age, current_money, patrimony, life_path, difficulty, is_game_over, created_at, updated_at',
    )
    .single();

  if (error) throw mapSupabaseError(error);
  if (!data) throw toError('Save não encontrado ou sem permissão.', 'NOT_FOUND');
  return rowToSummary(data as DbRow);
}

export async function loadCloudSave(saveId: string): Promise<CloudSaveRecord> {
  const client = requireClient();
  const userId = await getUserId();

  const { data, error } = await client
    .from('game_saves')
    .select('*')
    .eq('id', saveId)
    .eq('user_id', userId)
    .single();

  if (error) throw mapSupabaseError(error);
  if (!data) throw toError('Save não encontrado.', 'NOT_FOUND');

  const row = data as DbRow;
  return {
    ...rowToSummary(row),
    saveData: parseSaveData(row.save_data),
  };
}

export async function renameCloudSave(
  saveId: string,
  name: string,
): Promise<CloudSaveSummary> {
  const client = requireClient();
  const userId = await getUserId();
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    throw toError('Nome deve ter pelo menos 2 caracteres.', 'VALIDATION');
  }

  const { data, error } = await client
    .from('game_saves')
    .update({ name: trimmed })
    .eq('id', saveId)
    .eq('user_id', userId)
    .select(
      'id, user_id, name, slot, character_name, current_age, current_money, patrimony, life_path, difficulty, is_game_over, created_at, updated_at',
    )
    .single();

  if (error) throw mapSupabaseError(error);
  if (!data) throw toError('Save não encontrado.', 'NOT_FOUND');
  return rowToSummary(data as DbRow);
}

export async function duplicateCloudSave(saveId: string): Promise<CloudSaveSummary> {
  const record = await loadCloudSave(saveId);
  const copyName = `${record.name} (cópia)`;
  return createCloudSave(copyName, record.saveData);
}

export async function deleteCloudSave(saveId: string): Promise<void> {
  const client = requireClient();
  const userId = await getUserId();

  const { error } = await client
    .from('game_saves')
    .delete()
    .eq('id', saveId)
    .eq('user_id', userId);

  if (error) throw mapSupabaseError(error);
}

export function isCloudAvailable(): boolean {
  return isSupabaseConfigured;
}

export type { CloudServiceError };
