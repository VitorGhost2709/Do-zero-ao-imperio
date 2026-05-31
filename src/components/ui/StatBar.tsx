import { motion } from 'framer-motion';
import type { StatTheme } from '../../config/visualTheme';
import { DEBT_THRESHOLD } from '../../types/game';

interface StatBarProps {
  theme: StatTheme;
  value: number;
  index?: number;
}

function getBarPercent(
  value: number,
  theme: StatTheme,
): number {
  if (theme.isMoney) {
    if (value < 0) return 8;
    return Math.max(0, Math.min(100, (value / 500) * 100));
  }
  return Math.max(0, Math.min(100, value));
}

function getDangerState(value: number, theme: StatTheme): 'none' | 'warn' | 'critical' {
  if (theme.isMoney && value < DEBT_THRESHOLD) return 'critical';
  if (theme.isMoney && value < 0) return 'warn';
  if (theme.highThreshold !== undefined && value >= theme.highThreshold)
    return value >= 90 ? 'critical' : 'warn';
  if (theme.lowThreshold !== undefined && value <= theme.lowThreshold)
    return value <= 12 ? 'critical' : 'warn';
  return 'none';
}

export function StatBar({ theme, value, index = 0 }: StatBarProps) {
  const Icon = theme.icon;
  const danger = getDangerState(value, theme);
  const barPct = getBarPercent(value, theme);

  const displayValue = theme.isMoney
    ? value < 0
      ? `Dívida R$ ${Math.abs(value).toLocaleString('pt-BR')}`
      : `R$ ${value.toLocaleString('pt-BR')}`
    : String(value);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`group rounded-lg border px-2.5 py-2 transition ${
        danger === 'critical'
          ? 'border-red-500/40 bg-red-500/8'
          : danger === 'warn'
            ? 'border-orange-500/30 bg-orange-500/5'
            : 'border-transparent bg-empire-surface/40 hover:bg-empire-surface/70'
      }`}
      title={theme.tooltip}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5 text-xs text-slate-400">
          <Icon className={`h-3.5 w-3.5 shrink-0 ${theme.iconClass}`} />
          <span className="truncate">{theme.label}</span>
        </span>
        <span
          className={`shrink-0 text-xs font-semibold tabular-nums ${
            danger === 'critical'
              ? 'text-red-400'
              : danger === 'warn'
                ? 'text-orange-300'
                : 'text-slate-200'
          }`}
        >
          {displayValue}
        </span>
      </div>

      {!theme.isMoney && (
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-empire-bg/90">
          <motion.div
            className={`h-full rounded-full ${theme.barClass} ${
              danger !== 'none' ? theme.glowClass : 'opacity-80'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${barPct}%` }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          />
        </div>
      )}

      {theme.isMoney && value < DEBT_THRESHOLD && (
        <p className="mt-1 text-[10px] text-red-400/90">Endividado — penalidades ativas</p>
      )}

      <p className="mt-1 max-h-0 overflow-hidden text-[10px] leading-snug text-slate-500 opacity-0 transition-all group-hover:max-h-8 group-hover:opacity-100">
        {theme.tooltip}
      </p>
    </motion.div>
  );
}
