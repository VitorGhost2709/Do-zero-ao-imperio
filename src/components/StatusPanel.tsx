import { LayoutGrid } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { formatTime } from '../utils/gameLogic';
import { STAT_THEMES } from '../config/visualTheme';
import type { CharacterStats } from '../types/game';
import { StatBar } from './ui/StatBar';
import { Badge } from './ui/Badge';

export function StatusPanel() {
  const stats = useGameStore((s) => s.stats);
  const time = useGameStore((s) => s.time);

  return (
    <aside className="empire-card p-4">
      <div className="mb-4 flex items-center justify-between border-b border-empire-border/60 pb-3">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-empire-gold" />
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Império interior
          </h2>
        </div>
        <Badge variant="gold">{formatTime(time)}</Badge>
      </div>

      <div className="space-y-1">
        {STAT_THEMES.map((theme, i) => (
          <StatBar
            key={theme.key}
            theme={theme}
            value={stats[theme.key as keyof CharacterStats]}
            index={i}
          />
        ))}
      </div>
    </aside>
  );
}
