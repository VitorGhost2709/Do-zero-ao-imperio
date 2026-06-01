import { motion, AnimatePresence } from 'framer-motion';
import type { EffectLine } from '../../utils/actionFeedbackPreview';
import { useIsMobile, usePrefersReducedMotion } from '../../hooks/useMediaQuery';

export interface FloatingFeedback {
  id: string;
  lines: EffectLine[];
}

interface FloatingEffectProps {
  feedback: FloatingFeedback | null;
}

/** Feedback inline dentro do painel de ações — evita overlay fixo na tela inteira (bug mobile). */
export function FloatingEffect({ feedback }: FloatingEffectProps) {
  const isMobile = useIsMobile();
  const reducedMotion = usePrefersReducedMotion();

  if (isMobile || !feedback) return null;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-2 z-10 flex justify-center overflow-hidden px-2"
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={feedback.id}
          className="flex max-w-full flex-col items-center gap-0.5"
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {feedback.lines.map((line, i) => (
            <span
              key={i}
              className={`max-w-[min(100%,280px)] truncate rounded-md px-2 py-0.5 text-center text-xs font-bold shadow-lg backdrop-blur-sm ${
                line.variant === 'positive'
                  ? 'bg-emerald-500/90 text-white'
                  : line.variant === 'negative'
                    ? 'bg-red-500/90 text-white'
                    : 'bg-slate-700/90 text-slate-200'
              }`}
            >
              {line.text}
            </span>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
