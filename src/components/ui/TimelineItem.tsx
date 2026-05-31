import { motion } from 'framer-motion';
import { HISTORY_TYPE_META } from '../../config/visualTheme';
import type { HistoryEntryType } from '../../types/game';
import { classifyHistoryMessage } from '../../utils/historyClassifier';

interface TimelineItemProps {
  message: string;
  index?: number;
}

export function TimelineItem({ message, index = 0 }: TimelineItemProps) {
  const type: HistoryEntryType = classifyHistoryMessage(message);
  const meta = HISTORY_TYPE_META[type];
  const Icon = meta.icon;
  const isCritical = type === 'crisis';

  return (
    <motion.li
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.2) }}
      className={`relative border-l-2 pl-3 py-1.5 text-xs leading-relaxed ${meta.borderClass} ${meta.bgClass} rounded-r-lg pr-2 ${
        isCritical ? 'text-red-200/95' : 'text-slate-300'
      }`}
    >
      <span className="mb-0.5 flex items-center gap-1 text-[9px] uppercase tracking-wider text-slate-500">
        <Icon className="h-3 w-3 opacity-70" />
        {meta.label}
      </span>
      <p>{message}</p>
    </motion.li>
  );
}
