import { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingDown, TrendingUp } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { formatStatChangeLine } from '../utils/monthSummaryLogic';
import { useIsMobile } from '../hooks/useMediaQuery';

const TYPE_STYLES = {
  positive: 'text-emerald-400',
  negative: 'text-red-400',
  neutral: 'text-slate-400',
  warning: 'text-amber-400',
} as const;

export function MonthSummaryCard() {
  const summary = useGameStore((s) => s.lastMonthSummary);
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(false);

  if (!summary) return null;

  const primaryChanges = summary.statChanges.filter(
    (c) => c.key === 'money' || c.key === 'stress' || c.key === 'energy',
  );
  const displayChanges = isMobile && !expanded ? primaryChanges : summary.statChanges;
  const displayBreakdown =
    isMobile && !expanded ? summary.breakdown.slice(0, 4) : summary.breakdown;

  const hasMore =
    isMobile &&
    (summary.statChanges.length > primaryChanges.length ||
      summary.breakdown.length > 4);

  return (
    <section className="empire-card max-w-full overflow-hidden p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-empire-gold">Resumo do mês</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Após: {summary.actionName}
          </p>
        </div>
        {hasMore && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex shrink-0 items-center gap-1 rounded-lg border border-empire-border px-2.5 py-1 text-[10px] font-medium text-slate-400 hover:text-white"
          >
            {expanded ? (
              <>
                Menos <ChevronUp className="h-3 w-3" />
              </>
            ) : (
              <>
                Ver detalhes <ChevronDown className="h-3 w-3" />
              </>
            )}
          </button>
        )}
      </div>

      <ul className="mt-3 space-y-2">
        {displayChanges.map((change) => (
          <li
            key={change.key}
            className="flex items-start gap-2 rounded-lg border border-empire-border/50 bg-empire-surface/60 px-3 py-2 text-xs"
          >
            {change.delta >= 0 && change.key !== 'stress' ? (
              <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
            ) : change.delta < 0 || (change.key === 'stress' && change.delta > 0) ? (
              <TrendingDown className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
            ) : (
              <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
            )}
            <span className="min-w-0 break-words text-slate-300">
              {formatStatChangeLine(change)}
            </span>
          </li>
        ))}
      </ul>

      {displayBreakdown.length > 0 && (
        <div className="mt-3 border-t border-empire-border/50 pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Motivos
          </p>
          <ul className="mt-2 space-y-1">
            {displayBreakdown.map((item, i) => (
              <li
                key={`${item.label}-${i}`}
                className={`break-words text-xs ${TYPE_STYLES[item.type]}`}
              >
                · {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
