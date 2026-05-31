import { AnimatePresence, motion } from 'framer-motion';
import {
  Target,
  Trophy,
  Briefcase,
  Building2,
  AlertTriangle,
  Bell,
} from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';
import type { NotificationType } from '../types/game';

const ICONS: Record<NotificationType, React.ElementType> = {
  objective: Target,
  achievement: Trophy,
  promotion: Briefcase,
  business: Building2,
  crisis: AlertTriangle,
  warning: Bell,
};

const COLORS: Record<NotificationType, string> = {
  objective: 'border-empire-accent/50 bg-empire-accent/15',
  achievement: 'border-empire-gold/50 bg-empire-gold/15',
  promotion: 'border-blue-500/50 bg-blue-500/15',
  business: 'border-empire-success/50 bg-empire-success/15',
  crisis: 'border-red-500/50 bg-red-500/15',
  warning: 'border-orange-500/50 bg-orange-500/15',
};

export function NotificationStack() {
  const notifications = useNotificationStore((s) => s.notifications);

  return (
    <div className="pointer-events-none fixed right-2 top-14 z-40 flex w-[calc(100%-1rem)] max-w-xs flex-col gap-2 sm:right-4 sm:top-20 sm:z-50 sm:max-w-sm">
      <AnimatePresence>
        {notifications.map((n) => {
          const Icon = ICONS[n.type] ?? Bell;
          return (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: 'spring', damping: 22 }}
              className={`pointer-events-auto rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md ${COLORS[n.type]}`}
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                <div>
                  <p className="text-sm font-semibold text-white">{n.title}</p>
                  <p className="text-xs text-slate-300">{n.message}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
