import { AnimatePresence, motion } from 'framer-motion';
import { Cloud, LogOut, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { AuthModal } from './AuthModal';
import { CloudSavesPanel } from './CloudSavesPanel';

interface AccountPanelProps {
  open: boolean;
  onClose: () => void;
}

export function AccountPanel({ open, onClose }: AccountPanelProps) {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-3 top-[8vh] z-[71] mx-auto max-h-[84vh] w-full max-w-lg overflow-hidden rounded-2xl border border-empire-border/80 bg-gradient-to-b from-empire-card to-empire-bg shadow-2xl sm:inset-x-auto sm:right-6 sm:top-20 sm:max-h-[80vh]"
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
          >
            <div className="flex items-center justify-between border-b border-empire-border/60 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-empire-gold" />
                <div>
                  <h2 className="text-sm font-bold text-white">Conta & Saves</h2>
                  {user && (
                    <p className="truncate text-[10px] text-slate-500">{user.email}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {user && (
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] text-slate-400 hover:bg-empire-surface hover:text-red-400"
                    title="Sair"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sair
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-empire-surface hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[calc(84vh-3.5rem)] overflow-y-auto p-4 sm:p-5">
              {user ? <CloudSavesPanel onClose={onClose} /> : <AuthModal />}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
