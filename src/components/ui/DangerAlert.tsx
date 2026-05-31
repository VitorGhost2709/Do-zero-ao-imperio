import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export function DangerAlert() {
  const stats = useGameStore((s) => s.stats);
  const gameOver = useGameStore((s) => s.gameOver);

  const nearCollapse =
    !gameOver &&
    (stats.physicalHealth <= 18 ||
      stats.mentalHealth <= 18 ||
      stats.energy <= 12 ||
      stats.stress >= 88);

  return (
    <AnimatePresence>
      {nearCollapse && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-2 rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-2.5 text-xs text-red-200">
            <AlertTriangle className="h-4 w-4 shrink-0 animate-pulse text-red-400" />
            <span>
              <strong>Perigo iminente.</strong> Sua saúde ou energia está no limite — descanse ou
              reduza o ritmo.
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
