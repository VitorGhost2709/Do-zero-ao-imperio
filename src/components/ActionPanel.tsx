import { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  BookOpen,
  Moon,
  Users,
  Dumbbell,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { ACTIONS } from '../data/actions';
import { useGameStore } from '../store/gameStore';
import type { ActionId } from '../types/game';
import { canAffordAction, computeActionEffects } from '../utils/gameLogic';
import { formatEffectLines } from '../utils/actionFeedbackPreview';
import { FloatingEffect, type FloatingFeedback } from './ui/FloatingEffect';
import { useIsMobile } from '../hooks/useMediaQuery';

const ICON_MAP: Record<string, LucideIcon> = {
  Briefcase,
  BookOpen,
  Moon,
  Users,
  Dumbbell,
  TrendingUp,
};

export function ActionPanel() {
  const performAction = useGameStore((s) => s.performAction);
  const stats = useGameStore((s) => s.stats);
  const purchasedUpgrades = useGameStore((s) => s.purchasedUpgrades);
  const currentCareerId = useGameStore((s) => s.currentCareerId);
  const currentHousingId = useGameStore((s) => s.currentHousingId);
  const traitId = useGameStore((s) => s.traitId);
  const difficultyId = useGameStore((s) => s.difficultyId);
  const gameOver = useGameStore((s) => s.gameOver);
  const activeEvent = useGameStore((s) => s.activeEvent);
  const isMobile = useIsMobile();

  const [feedback, setFeedback] = useState<FloatingFeedback | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const disabled = !!gameOver || !!activeEvent;

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const handleAction = useCallback(
    (actionId: ActionId) => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
      setFeedback(null);

      const { effects } = computeActionEffects(
        actionId,
        purchasedUpgrades,
        stats,
        currentCareerId,
        currentHousingId,
        traitId,
        difficultyId,
      );
      const lines = formatEffectLines(effects);
      if (lines.length > 0 && !isMobile) {
        const id = crypto.randomUUID();
        setFeedback({ id, lines });
        feedbackTimerRef.current = setTimeout(() => {
          setFeedback(null);
          feedbackTimerRef.current = null;
        }, 1600);
      }

      performAction(actionId);
    },
    [
      performAction,
      purchasedUpgrades,
      stats,
      currentCareerId,
      currentHousingId,
      traitId,
      difficultyId,
      isMobile,
    ],
  );

  return (
    <section className="empire-card relative max-w-full overflow-hidden p-4 md:p-5">
      <FloatingEffect feedback={feedback} />
      <h2 className="empire-gradient-text text-sm font-bold uppercase tracking-widest">
        Ações do mês
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        Cada escolha avança 1 mês na sua vida.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
        {ACTIONS.map((action, i) => {
          const Icon = ICON_MAP[action.icon] ?? Briefcase;
          const canDo = canAffordAction(stats, action.id as ActionId);
          const isDisabled = disabled || !canDo;

          return (
            <motion.button
              key={action.id}
              type="button"
              disabled={isDisabled}
              onClick={() => handleAction(action.id as ActionId)}
              className={`relative flex min-h-[88px] max-w-full flex-col items-start rounded-xl border p-3 text-left transition sm:min-h-[96px] sm:p-4 ${
                isDisabled
                  ? 'cursor-not-allowed border-empire-border/40 bg-empire-bg/50 opacity-45'
                  : 'border-empire-border bg-gradient-to-br from-empire-surface to-empire-card hover:border-empire-gold/40 hover:shadow-[0_0_20px_rgba(232,184,74,0.12)]'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={
                isDisabled || isMobile ? {} : { y: -2 }
              }
              whileTap={isDisabled ? {} : { scale: 0.98 }}
            >
              <div
                className={`mb-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  isDisabled ? 'bg-slate-800' : 'bg-empire-gold/15'
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${isDisabled ? 'text-slate-600' : 'text-empire-gold'}`}
                />
              </div>
              <span className="w-full break-words text-sm font-semibold text-white">
                {action.name}
              </span>
              <span className="mt-1 line-clamp-2 w-full break-words text-[10px] leading-snug text-slate-500 sm:text-[11px]">
                {action.description}
              </span>
            </motion.button>
          );
        })}
      </div>

      {activeEvent && (
        <motion.p
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mt-4 text-center text-xs font-medium text-empire-gold"
        >
          Resolva o evento antes de continuar
        </motion.p>
      )}
    </section>
  );
}
