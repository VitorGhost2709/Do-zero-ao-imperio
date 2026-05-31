import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollText, ChevronDown, ChevronUp } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { groupHistoryByAge, parseAgeFromMessage } from '../utils/historyClassifier';
import { TimelineItem } from './ui/TimelineItem';
import { EmptyState } from './ui/EmptyState';

export function HistoryLog() {
  const history = useGameStore((s) => s.history);
  const [expanded, setExpanded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => {
      setIsDesktop(mq.matches);
      if (mq.matches) setExpanded(true);
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const grouped = groupHistoryByAge(history);
  const ages = [...grouped.keys()].filter((a) => a > 0);
  const showContent = expanded || isDesktop;

  return (
    <section className="empire-card overflow-hidden">
      <button
        type="button"
        onClick={() => !isDesktop && setExpanded((e) => !e)}
        className={`flex w-full items-center justify-between p-4 text-left ${isDesktop ? 'cursor-default' : ''}`}
        aria-expanded={showContent}
      >
        <div className="flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-empire-gold" />
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Linha do tempo
          </h2>
        </div>
        {!isDesktop && (
          <span className="text-slate-500">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {showContent && (
          <motion.div
            initial={isDesktop ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="max-h-56 space-y-4 overflow-y-auto px-4 pb-4 lg:max-h-72">
              {history.length === 0 ? (
                <EmptyState icon={ScrollText} title="Sua história começa agora" />
              ) : ages.length > 0 ? (
                ages.map((age) => (
                  <div key={age}>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-empire-gold/80">
                      Aos {age} anos
                    </p>
                    <ul className="space-y-1.5">
                      {(grouped.get(age) ?? []).map((entry, i) => (
                        <TimelineItem
                          key={entry.id}
                          message={entry.message}
                          index={i}
                        />
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <ul className="space-y-1.5">
                  {history.map((entry, i) => (
                    <TimelineItem
                      key={entry.id}
                      message={entry.message}
                      index={i}
                    />
                  ))}
                </ul>
              )}
              {history.some((e) => !parseAgeFromMessage(e.message)) && (
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Início
                  </p>
                  <ul className="space-y-1.5">
                    {history
                      .filter((e) => !parseAgeFromMessage(e.message))
                      .map((entry, i) => (
                        <TimelineItem
                          key={entry.id}
                          message={entry.message}
                          index={i}
                        />
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
