import { useEffect } from 'react';
import { CalendarDays } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { getMonthLabel } from '../utils/gameLogic';
import { useIsMobile, usePrefersReducedMotion } from '../hooks/useMediaQuery';

const VISIBLE_MS = 1400;

export function MonthTransitionOverlay() {
  const transition = useGameStore((s) => s.monthTransition);
  const dismiss = useGameStore((s) => s.dismissMonthTransition);
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!transition) return;

    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });

    const timer = window.setTimeout(() => {
      dismiss();
    }, VISIBLE_MS);

    return () => window.clearTimeout(timer);
  }, [transition?.id, dismiss, reducedMotion]);

  if (!transition) return null;

  const fromLabel = `${getMonthLabel({ age: transition.fromAge, month: transition.fromMonth })} · ${transition.fromAge} anos`;
  const toLabel = `${getMonthLabel({ age: transition.toAge, month: transition.toMonth })} · ${transition.toAge} anos`;

  const cardClass = isMobile
    ? 'mobile-safe-card max-w-full px-4 py-3'
    : 'max-w-full rounded-2xl border border-empire-gold/40 bg-empire-card px-4 py-3 shadow-lg sm:px-5';

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center px-3 pt-[max(0.75rem,env(safe-area-inset-top))]"
      role="status"
      aria-live="polite"
    >
      <div className={cardClass}>
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
    </div>
  );
}
