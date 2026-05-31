import { useCallback, useEffect, useState } from 'react';
import {
  CloudUpload,
  Copy,
  Download,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { DIFFICULTY_MAP } from '../data/difficulties';
import { LIFE_PATH_MAP } from '../data/lifePaths';
import {
  createCloudSave,
  deleteCloudSave,
  duplicateCloudSave,
  listCloudSaves,
  renameCloudSave,
  type CloudServiceError,
} from '../services/cloudSaveService';
import { useGameStore } from '../store/gameStore';
import { hasSavedGame } from '../utils/storage';
import type { CloudSaveSummary } from '../types/save';
import type { LifePathId } from '../types/game';
import { suggestCloudSaveName } from '../utils/saveSerialization';

interface CloudSavesPanelProps {
  onClose?: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function errorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    return (err as CloudServiceError).message;
  }
  return 'Erro inesperado. Tente novamente.';
}

export function CloudSavesPanel({ onClose }: CloudSavesPanelProps) {
  const gameState = useGameStore();
  const saveToCloud = useGameStore((s) => s.saveToCloud);
  const loadFromCloud = useGameStore((s) => s.loadFromCloud);
  const uploadLocalToCloud = useGameStore((s) => s.uploadLocalToCloud);
  const activeCloudSaveId = useGameStore((s) => s.activeCloudSaveId);
  const cloudSyncStatus = useGameStore((s) => s.cloudSyncStatus);
  const profileComplete = useGameStore((s) => s.profileComplete);

  const [saves, setSaves] = useState<CloudSaveSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null,
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const list = await listCloudSaves();
      setSaves(list);
    } catch (err) {
      setMessage({ type: 'err', text: errorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const runAction = async (id: string, fn: () => Promise<void>) => {
    setActionId(id);
    setMessage(null);
    try {
      await fn();
      await refresh();
    } catch (err) {
      setMessage({ type: 'err', text: errorMessage(err) });
    } finally {
      setActionId(null);
    }
  };

  const handleSaveActive = () =>
    runAction('save-active', async () => {
      const result = await saveToCloud();
      if (!result.ok) throw { message: result.message };
      setMessage({ type: 'ok', text: 'Save salvo na nuvem!' });
    });

  const handleUploadLocal = () =>
    runAction('upload-local', async () => {
      const result = await uploadLocalToCloud();
      if (!result.ok) throw { message: result.message };
      setMessage({ type: 'ok', text: 'Save local enviado para a nuvem!' });
    });

  const handleNewFromCurrent = () =>
    runAction('new-save', async () => {
      const name = suggestCloudSaveName(gameState);
      const created = await createCloudSave(name, gameState);
      useGameStore.getState().setCloudTracking(created.id, 'synced', new Date().toISOString());
      setMessage({ type: 'ok', text: `Novo save "${created.name}" criado.` });
    });

  const showUploadLocal =
    profileComplete && hasSavedGame() && !activeCloudSaveId;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-empire-gold/20 bg-empire-gold/5 p-3 text-xs text-slate-400">
        <p>
          Status:{' '}
          <span className="text-slate-200">
            {cloudSyncStatus === 'local_only' && 'Apenas local'}
            {cloudSyncStatus === 'synced' && 'Sincronizado'}
            {cloudSyncStatus === 'dirty' && 'Alterações não enviadas'}
            {cloudSyncStatus === 'syncing' && 'Salvando…'}
            {cloudSyncStatus === 'error' && 'Erro na última sync'}
          </span>
        </p>
        {activeCloudSaveId && (
          <p className="mt-1 text-[10px] text-slate-500">
            Save ativo na nuvem selecionado.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {activeCloudSaveId && (
          <button
            type="button"
            disabled={actionId !== null || cloudSyncStatus === 'syncing'}
            onClick={handleSaveActive}
            className="flex items-center gap-1.5 rounded-lg border border-empire-gold/40 bg-empire-gold/15 px-3 py-2 text-xs font-medium text-empire-gold disabled:opacity-50"
          >
            {actionId === 'save-active' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Salvar na nuvem
          </button>
        )}
        {profileComplete && (
          <button
            type="button"
            disabled={actionId !== null}
            onClick={handleNewFromCurrent}
            className="flex items-center gap-1.5 rounded-lg border border-empire-border px-3 py-2 text-xs text-slate-300 hover:border-empire-accent/40"
          >
            <Plus className="h-3.5 w-3.5" />
            Novo save (jogo atual)
          </button>
        )}
        {showUploadLocal && (
          <button
            type="button"
            disabled={actionId !== null}
            onClick={handleUploadLocal}
            className="flex items-center gap-1.5 rounded-lg border border-empire-accent/40 bg-empire-accent/10 px-3 py-2 text-xs text-empire-accent"
          >
            <CloudUpload className="h-3.5 w-3.5" />
            Enviar save local
          </button>
        )}
      </div>

      {message && (
        <p
          className={`text-xs ${message.type === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}
        >
          {message.text}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-empire-gold" />
        </div>
      ) : saves.length === 0 ? (
        <div className="rounded-xl border border-dashed border-empire-border/60 py-8 text-center text-xs text-slate-500">
          Nenhum save na nuvem ainda.
          {profileComplete && (
            <p className="mt-2">Crie um novo save ou envie o progresso local.</p>
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          {saves.map((save) => {
            const isActive = save.id === activeCloudSaveId;
            const busy = actionId === save.id;
            const pathLabel =
              LIFE_PATH_MAP[(save.lifePath as LifePathId) ?? 'balanced']?.name ??
              save.lifePath;
            const diffLabel =
              DIFFICULTY_MAP[save.difficulty as keyof typeof DIFFICULTY_MAP]?.name ??
              save.difficulty;

            return (
              <li
                key={save.id}
                className={`rounded-xl border p-3 ${
                  isActive
                    ? 'border-empire-gold/40 bg-empire-gold/5'
                    : 'border-empire-border/60 bg-empire-surface/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {save.name}
                      {isActive && (
                        <span className="ml-2 text-[10px] font-normal text-empire-gold">
                          (ativo)
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {save.characterName ?? '—'} · {save.currentAge ?? '?'} anos · R${' '}
                      {(save.patrimony ?? 0).toLocaleString('pt-BR')}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      {pathLabel} · {diffLabel}
                      {save.isGameOver ? ' · Fim de jogo' : ''}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-600">
                      Atualizado {formatDate(save.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    disabled={busy || actionId !== null}
                    onClick={() =>
                      runAction(save.id, async () => {
                        const result = await loadFromCloud(save.id);
                        if (!result.ok) throw { message: result.message };
                        setMessage({ type: 'ok', text: 'Save carregado!' });
                        onClose?.();
                      })
                    }
                    className="flex items-center gap-1 rounded-md bg-empire-accent/20 px-2 py-1 text-[10px] text-empire-accent"
                  >
                    {busy ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Download className="h-3 w-3" />
                    )}
                    Carregar
                  </button>
                  {isActive && (
                    <button
                      type="button"
                      disabled={busy || actionId !== null}
                      onClick={handleSaveActive}
                      className="flex items-center gap-1 rounded-md bg-empire-gold/20 px-2 py-1 text-[10px] text-empire-gold"
                    >
                      <Save className="h-3 w-3" />
                      Salvar
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busy || actionId !== null}
                    onClick={() => {
                      const name = window.prompt('Novo nome do save:', save.name);
                      if (!name?.trim()) return;
                      runAction(save.id, async () => {
                        await renameCloudSave(save.id, name.trim());
                        setMessage({ type: 'ok', text: 'Save renomeado.' });
                      });
                    }}
                    className="flex items-center gap-1 rounded-md border border-empire-border/60 px-2 py-1 text-[10px] text-slate-400"
                  >
                    <Pencil className="h-3 w-3" />
                    Renomear
                  </button>
                  <button
                    type="button"
                    disabled={busy || actionId !== null}
                    onClick={() =>
                      runAction(save.id, async () => {
                        await duplicateCloudSave(save.id);
                        setMessage({ type: 'ok', text: 'Save duplicado.' });
                      })
                    }
                    className="flex items-center gap-1 rounded-md border border-empire-border/60 px-2 py-1 text-[10px] text-slate-400"
                  >
                    <Copy className="h-3 w-3" />
                    Duplicar
                  </button>
                  <button
                    type="button"
                    disabled={busy || actionId !== null}
                    onClick={() => {
                      if (
                        !window.confirm(
                          `Excluir "${save.name}" da nuvem? Esta ação não pode ser desfeita.`,
                        )
                      ) {
                        return;
                      }
                      runAction(save.id, async () => {
                        await deleteCloudSave(save.id);
                        if (activeCloudSaveId === save.id) {
                          useGameStore.getState().detachCloudSave();
                        }
                        setMessage({ type: 'ok', text: 'Save excluído.' });
                      });
                    }}
                    className="flex items-center gap-1 rounded-md border border-red-500/30 px-2 py-1 text-[10px] text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                    Excluir
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
