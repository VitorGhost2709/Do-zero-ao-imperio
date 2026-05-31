import { motion } from 'framer-motion';

interface ProgressBarProps {
  percent: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  percent,
  className = '',
  barClassName = 'bg-gradient-to-r from-empire-gold/80 to-empire-gold',
  showLabel = false,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, percent));
  return (
    <div className={className}>
      <div className="h-1.5 overflow-hidden rounded-full bg-empire-bg/80">
        <motion.div
          className={`h-full rounded-full ${barClassName}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <p className="mt-0.5 text-right text-[10px] tabular-nums text-slate-500">
          {Math.round(pct)}%
        </p>
      )}
    </div>
  );
}
