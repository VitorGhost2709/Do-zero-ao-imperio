import { motion } from 'framer-motion';
import { RotateCcw, Sunset } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { canRetire } from '../utils/retirementLogic';
import { AuthButton } from './AuthButton';
import { GameLogo } from './GameLogo';

export function Header() {
  const resetGame = useGameStore((s) => s.resetGame);
  const retireCharacter = useGameStore((s) => s.retireCharacter);
  const state = useGameStore();

  const showRetire = canRetire(state);

  const handleReset = () => {
    if (
      window.confirm(
        'Tem certeza que deseja resetar todo o progresso? Esta ação não pode ser desfeita.',
      )
    ) {
      resetGame();
    }
  };

  const handleRetire = () => {
    if (
      window.confirm(
        'Aposentar seu personagem encerra a jornada com uma classificação final. Deseja continuar?',
      )
    ) {
      retireCharacter();
    }
  };

  return (
    <header className="flex items-center justify-between gap-2 border-b border-empire-border bg-empire-surface/80 px-4 py-4 backdrop-blur-sm md:px-6">
      <motion.div
        className="flex min-w-0 items-center gap-3"
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <GameLogo size="md" />
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold tracking-tight text-white md:text-xl">
            Do Zero ao Império
          </h1>
          <p className="text-xs text-slate-400">
            Construa sua vida, um mês de cada vez
          </p>
        </div>
      </motion.div>

      <div className="flex shrink-0 items-center gap-2">
        <AuthButton />
        {showRetire && (
          <motion.button
            type="button"
            onClick={handleRetire}
            className="flex items-center gap-1.5 rounded-lg border border-empire-gold/40 bg-empire-gold/15 px-2.5 py-2 text-xs font-medium text-empire-gold sm:px-3 sm:text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Sunset className="h-4 w-4" />
            <span className="hidden sm:inline">Aposentar</span>
          </motion.button>
        )}
        <motion.button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-2 rounded-lg border border-empire-border bg-empire-card px-2.5 py-2 text-sm text-slate-300 transition hover:border-red-500/50 hover:text-red-400 sm:px-3"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <RotateCcw className="h-4 w-4" />
          <span className="hidden sm:inline">Resetar</span>
        </motion.button>
      </div>
    </header>
  );
}
