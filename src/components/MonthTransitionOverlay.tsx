import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { getMonthLabel } from '../utils/gameLogic';
import { usePrefersReducedMotion } from '../hooks/useMediaQuery';

const VISIBLE_MS = 1400;

export function MonthTransitionOverlay() {
  const transition = useGameStore((s) => s.monthTransition);
  const dismiss = useGameStore((s) => s.dismissMonthTransition);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!transition) return;

    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });

    const timer = window.setTimeout(() => {
      dismiss();
    }, VISIBLE_MS);

    return () => window.clearTimeout(timer);
  }, [transition?.id, dismiss, reducedMotion]);

  const fromLabel = transition
    ? `${getMonthLabel({ age: transition.fromAge, month: transition.fromMonth })} · ${transition.fromAge} anos`
    : '';
  const toLabel = transition
    ? `${getMonthLabel({ age: transition.toAge, month: transition.toMonth })} · ${transition.toAge} anos`
    : '';

  return (
    <AnimatePresence>
      {transition && (
        <motion.div
          key={transition.id}
          className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center px-3 pt-[max(0.75rem,env(safe-area-inset-top))]"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: reducedMotion ? 0.1 : 0.25 }}
        >
          <div className="max-w-full rounded-2xl border border-empire-gold/40 bg-empire-card/95 px-4 py-3 shadow-lg backdrop-blur-md sm:px-5">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0 text-empire-gold" />
              <p className="text-xs font-semibold uppercase tracking-widest text-empire-gold">
                Mês encerrado
              </p>
            </div>
            <p className="mt-1.5 break-words text-center text-sm text-slate-200">
              <span className="text-slate-400">{fromLabel}</span>
              <span className="mx-2 text-empire-gold">→</span>
              <span className="font-medium text-white">{toLabel}</span>
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
