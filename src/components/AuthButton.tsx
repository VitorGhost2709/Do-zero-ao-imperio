import { useState } from 'react';
import { Cloud, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { AccountPanel } from './AccountPanel';

export function AuthButton() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const cloudSyncStatus = useGameStore((s) => s.cloudSyncStatus);

  const syncDot =
    cloudSyncStatus === 'dirty'
      ? 'bg-orange-400'
      : cloudSyncStatus === 'synced'
        ? 'bg-emerald-400'
        : cloudSyncStatus === 'error'
          ? 'bg-red-400'
          : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-1.5 rounded-lg border border-empire-border bg-empire-card px-2.5 py-2 text-xs font-medium text-slate-300 transition hover:border-empire-gold/40 hover:text-empire-gold sm:px-3 sm:text-sm"
      >
        {isSupabaseConfigured && user ? (
          <Cloud className="h-4 w-4" />
        ) : (
          <User className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">Conta / Saves</span>
        <span className="sm:hidden">Conta</span>
        {syncDot && (
          <span
            className={`absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ${syncDot}`}
          />
        )}
      </button>

      <AccountPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
