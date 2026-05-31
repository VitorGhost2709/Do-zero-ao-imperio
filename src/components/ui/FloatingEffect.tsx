import { motion, AnimatePresence } from 'framer-motion';
import type { EffectLine } from '../../utils/actionFeedbackPreview';

export interface FloatingFeedback {
  id: string;
  lines: EffectLine[];
  x: number;
  y: number;
}

interface FloatingEffectProps {
  feedbacks: FloatingFeedback[];
}

export function FloatingEffect({ feedbacks }: FloatingEffectProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[45] overflow-hidden">
      <AnimatePresence>
        {feedbacks.map((fb) => (
          <motion.div
            key={fb.id}
            className="absolute flex flex-col items-center gap-0.5"
            style={{ left: fb.x, top: fb.y }}
            initial={{ opacity: 0, y: 8, scale: 0.85 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, y: -48, scale: 0.9 }}
            transition={{ duration: 0.35 }}
          >
            {fb.lines.map((line, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-bold shadow-lg backdrop-blur-sm ${
                  line.variant === 'positive'
                    ? 'bg-emerald-500/90 text-white'
                    : line.variant === 'negative'
                      ? 'bg-red-500/90 text-white'
                      : 'bg-slate-700/90 text-slate-200'
                }`}
              >
                {line.text}
              </motion.span>
            ))}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
