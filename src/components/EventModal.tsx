import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import {
  EVENT_CATEGORY_META,
} from '../config/visualTheme';
import { RiskBadge } from './ui/RiskBadge';
import { Badge } from './ui/Badge';
import { getChoicePreview, getEventRiskLevel } from '../utils/choicePreview';
import { RANDOM_EVENTS } from '../data/events';
import { RARE_EVENTS } from '../data/rareEvents';

const ALL_EVENTS = [...RANDOM_EVENTS, ...RARE_EVENTS];

function resolveRisk(eventId: string, isRare?: boolean, riskLevel?: string) {
  const found = ALL_EVENTS.find((e) => e.id === eventId);
  return getEventRiskLevel({
    riskLevel: (found?.riskLevel ?? riskLevel) as 'low' | 'medium' | 'high' | 'extreme',
    isRare: found?.isRare ?? isRare,
  });
}

export function EventModal() {
  const activeEvent = useGameStore((s) => s.activeEvent);
  const resolveEventChoice = useGameStore((s) => s.resolveEventChoice);

  const cat = activeEvent
    ? EVENT_CATEGORY_META[activeEvent.category]
    : null;
  const CatIcon = cat?.icon ?? Sparkles;
  const risk = activeEvent
    ? resolveRisk(activeEvent.id, activeEvent.isRare, activeEvent.riskLevel)
    : 'medium';
  const isRare = activeEvent?.isRare;

  return (
    <AnimatePresence>
      {activeEvent && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/75 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl sm:p-6 ${
                isRare
                  ? 'empire-card-gold border-empire-gold/40 bg-gradient-to-b from-amber-950/30 to-empire-card'
                  : 'empire-card border-empire-border'
              }`}
              initial={{ scale: 0.92, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 40 }}
              transition={{ type: 'spring', damping: 24 }}
            >
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    isRare ? 'bg-empire-gold/25' : 'bg-empire-accent/20'
                  }`}
                >
                  <CatIcon className={`h-5 w-5 ${cat?.color ?? 'text-empire-accent'}`} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={isRare ? 'gold' : 'accent'}>
                    {isRare ? 'Evento raro' : cat?.label}
                  </Badge>
                  <RiskBadge level={risk} />
                </div>
              </div>

              <h2 className="text-xl font-bold text-white sm:text-2xl">
                {activeEvent.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {activeEvent.description}
              </p>

              <div className="mt-6 space-y-2.5">
                {activeEvent.choices.map((choice, i) => {
                  const preview = getChoicePreview(choice);
                  return (
                    <motion.button
                      key={choice.id}
                      type="button"
                      onClick={() => resolveEventChoice(choice.id)}
                      className={`w-full rounded-xl border px-4 py-3.5 text-left transition ${
                        preview.isRisky
                          ? 'border-orange-500/40 bg-orange-500/8 hover:border-orange-400/60'
                          : 'border-empire-border bg-empire-surface/80 hover:border-empire-gold/35 hover:bg-empire-gold/5'
                      }`}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 + i * 0.05 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <p className="text-sm font-semibold text-white">
                        {choice.label}
                      </p>
                      {preview.lines.length > 0 && (
                        <p className="mt-1 text-[11px] text-slate-500">
                          {preview.lines.join(' · ')}
                        </p>
                      )}
                      {preview.warnings.map((w) => (
                        <p
                          key={w}
                          className="mt-1 text-[10px] font-medium text-orange-400/90"
                        >
                          ⚠ {w}
                        </p>
                      ))}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
