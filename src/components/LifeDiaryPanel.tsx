import { BookMarked } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import type { LifeDiaryEntryType } from '../types/game';
import { EmptyState } from './ui/EmptyState';

const TYPE_LABELS: Record<LifeDiaryEntryType, string> = {
  career: 'Carreira',
  love: 'Amor',
  money: 'Dinheiro',
  health: 'Saúde',
  business: 'Negócio',
  housing: 'Moradia',
  achievement: 'Conquista',
  tragedy: 'Tragédia',
  legacy: 'Legado',
  family: 'Família',
};

const TYPE_COLORS: Record<LifeDiaryEntryType, string> = {
  career: 'text-empire-accent border-empire-accent/30',
  love: 'text-rose-300 border-rose-500/30',
  money: 'text-empire-gold border-empire-gold/30',
  health: 'text-emerald-300 border-emerald-500/30',
  business: 'text-empire-success border-empire-success/30',
  housing: 'text-sky-300 border-sky-500/30',
  achievement: 'text-amber-200 border-amber-500/30',
  tragedy: 'text-red-300 border-red-500/30',
  legacy: 'text-violet-300 border-violet-500/30',
  family: 'text-orange-200 border-orange-500/30',
};

export function LifeDiaryPanel() {
  const lifeDiary = useGameStore((s) => s.lifeDiary);

  if (lifeDiary.length === 0) {
    return (
      <EmptyState
        icon={BookMarked}
        title="Diário vazio"
        description="Grandes marcos da sua vida aparecerão aqui automaticamente."
      />
    );
  }

  return (
    <div className="space-y-3 p-4">
      <p className="text-[10px] uppercase tracking-widest text-slate-500">
        Momentos que marcaram sua história — não é o histórico de ações mensais.
      </p>
      <ul className="space-y-3">
        {lifeDiary.map((entry) => (
          <li
            key={entry.id}
            className={`rounded-xl border bg-empire-surface/60 p-3 ${TYPE_COLORS[entry.type].split(' ')[1]}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className={`text-[10px] font-semibold uppercase tracking-wide ${TYPE_COLORS[entry.type].split(' ')[0]}`}
              >
                {TYPE_LABELS[entry.type]}
              </span>
              <span className="text-[10px] text-slate-500">
                {entry.age} anos · mês {entry.month}
              </span>
            </div>
            <h4 className="mt-1.5 text-sm font-semibold text-white">{entry.title}</h4>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              {entry.description}
            </p>
            {entry.partnerName && (
              <p className="mt-1.5 text-[10px] text-rose-300/80">
                Com {entry.partnerName}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
