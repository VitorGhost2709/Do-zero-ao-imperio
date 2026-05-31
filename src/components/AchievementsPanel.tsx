import { motion } from 'framer-motion';
import { Trophy, Lock } from 'lucide-react';
import { ACHIEVEMENTS } from '../data/achievements';
import { useGameStore } from '../store/gameStore';

const MONTHS = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

export function AchievementsPanel() {
  const unlocked = useGameStore((s) => s.unlockedAchievementIds);
  const meta = useGameStore((s) => s.achievementUnlockMeta);

  return (
    <section className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <Trophy className="h-4 w-4 text-empire-gold" />
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Conquistas
        </h2>
        <span className="ml-auto text-[10px] text-slate-500">
          {unlocked.length}/{ACHIEVEMENTS.length}
        </span>
      </div>

      <div className="grid max-h-64 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
        {ACHIEVEMENTS.map((ach, i) => {
          const open = unlocked.includes(ach.id);
          const unlockInfo = meta[ach.id];

          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              className={`rounded-xl border p-3 transition ${
                open
                  ? 'border-empire-gold/40 bg-gradient-to-br from-empire-gold/15 to-transparent shadow-[0_0_16px_rgba(232,184,74,0.1)]'
                  : 'border-empire-border/60 bg-empire-bg/40 opacity-75'
              }`}
            >
              <div className="flex items-start gap-2">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    open ? 'bg-empire-gold/25' : 'bg-empire-surface'
                  }`}
                >
                  {open ? (
                    <Trophy className="h-4 w-4 text-empire-gold" />
                  ) : (
                    <Lock className="h-4 w-4 text-slate-600" />
                  )}
                </div>
                <div>
                  <p
                    className={`text-xs font-semibold ${open ? 'text-white' : 'text-slate-500'}`}
                  >
                    {ach.title}
                  </p>
                  <p className="mt-0.5 text-[10px] leading-snug text-slate-600">
                    {ach.description}
                  </p>
                  {open && unlockInfo && (
                    <p className="mt-1 text-[9px] text-empire-gold/80">
                      Desbloqueada aos {unlockInfo.age} anos (
                      {MONTHS[unlockInfo.month - 1]})
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
