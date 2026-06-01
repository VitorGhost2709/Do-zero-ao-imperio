import { motion } from 'framer-motion';
import { Compass, AlertTriangle } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { getSuggestedGoal } from '../utils/suggestedGoalLogic';

export function SuggestedGoalPanel() {
  const state = useGameStore();
  const gameOver = useGameStore((s) => s.gameOver);

  if (gameOver || !state.profileComplete) return null;

  const goal = getSuggestedGoal(state);

  return (
    <motion.div
      className={`flex max-w-full items-start gap-3 overflow-hidden rounded-xl border px-4 py-3 ${
        goal.priority === 'critical'
          ? 'border-red-500/40 bg-red-500/10'
          : goal.priority === 'high'
            ? 'border-empire-gold/35 bg-empire-gold/8'
            : 'border-empire-border/80 bg-empire-surface/60'
      }`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {goal.priority === 'critical' ? (
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
      ) : (
        <Compass className="mt-0.5 h-4 w-4 shrink-0 text-empire-gold" />
      )}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Próximo passo sugerido
        </p>
        <p className="mt-0.5 break-words text-sm text-slate-200">{goal.text}</p>
      </div>
    </motion.div>
  );
}
