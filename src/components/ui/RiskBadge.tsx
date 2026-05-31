import type { EventRiskLevel } from '../../types/game';
import { RISK_STYLES } from '../../config/visualTheme';

interface RiskBadgeProps {
  level: EventRiskLevel;
  className?: string;
}

export function RiskBadge({ level, className = '' }: RiskBadgeProps) {
  const style = RISK_STYLES[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${style.className} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dotClass}`} />
      Risco {style.label}
    </span>
  );
}
