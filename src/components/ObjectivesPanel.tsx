import { motion } from 'framer-motion';
import { Target, Check } from 'lucide-react';
import { OBJECTIVES } from '../data/objectives';
import { useGameStore } from '../store/gameStore';
import { isObjectiveComplete } from '../utils/objectiveLogic';
import { getObjectiveProgress } from '../utils/objectiveProgress';
import { ProgressBar } from './ui/ProgressBar';

export function ObjectivesPanel() {
  const state = useGameStore();
  const completed = state.completedObjectiveIds;

  return (
    <section className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <Target className="h-4 w-4 text-empire-gold" />
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Objetivos
        </h2>
        <span className="ml-auto rounded-full bg-empire-surface px-2 py-0.5 text-[10px] tabular-nums text-slate-400">
          {completed.length}/{OBJECTIVES.length}
        </span>
      </div>

      <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
        {OBJECTIVES.map((obj, i) => {
          const done = completed.includes(obj.id);
          const ready = !done && isObjectiveComplete(obj, state);
          const progress = !done ? getObjectiveProgress(obj, state) : null;

          return (
            <motion.div
              key={obj.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className={`rounded-xl border p-3 ${
                done
                  ? 'border-emerald-500/35 bg-emerald-500/8'
                  : ready
                    ? 'border-empire-gold/45 bg-empire-gold/8 shadow-[0_0_12px_rgba(232,184,74,0.08)]'
                    : 'border-empire-border/80 bg-empire-surface/60'
              }`}
            >
              <div className="flex items-start gap-2">
                {done ? (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <div
                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border-2 ${
                      ready ? 'border-empire-gold bg-empire-gold/30' : 'border-slate-600'
                    }`}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{obj.title}</p>
                  <p className="text-[11px] text-slate-500">{obj.description}</p>
                  {progress?.hasProgress && !done && (
                    <div className="mt-2">
                      <p className="mb-1 text-[10px] tabular-nums text-empire-gold/90">
                        {progress.label}
                      </p>
                      <ProgressBar
                        percent={progress.percent}
                        barClassName="bg-gradient-to-r from-amber-700/80 to-empire-gold"
                      />
                    </div>
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
