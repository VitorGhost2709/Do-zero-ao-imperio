import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Home,
  Building2,
  Target,
  Trophy,
  BookMarked,
} from 'lucide-react';
import { CareerPanel } from './CareerPanel';
import { HousingPanel } from './HousingPanel';
import { BusinessPanel } from './BusinessPanel';
import { ObjectivesPanel } from './ObjectivesPanel';
import { AchievementsPanel } from './AchievementsPanel';
import { LifeDiaryPanel } from './LifeDiaryPanel';
import { useGameStore } from '../store/gameStore';
import { getAvailableCareers } from '../utils/careerLogic';

const TABS = [
  { id: 'career', label: 'Carreira', icon: Briefcase },
  { id: 'housing', label: 'Moradia', icon: Home },
  { id: 'business', label: 'Negócios', icon: Building2 },
  { id: 'diary', label: 'Diário', icon: BookMarked },
  { id: 'objectives', label: 'Objetivos', icon: Target },
  { id: 'achievements', label: 'Conquistas', icon: Trophy },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function ProgressTabs() {
  const [active, setActive] = useState<TabId>('career');
  const stats = useGameStore((s) => s.stats);
  const currentCareerId = useGameStore((s) => s.currentCareerId);
  const traitId = useGameStore((s) => s.traitId);
  const hasPromotion =
    getAvailableCareers(stats, currentCareerId, traitId).length > 0;

  return (
    <div className="empire-card max-w-full overflow-hidden">
      <div className="flex overflow-x-auto border-b border-empire-border/80 scrollbar-thin">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          const showDot = id === 'career' && hasPromotion && !isActive;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActive(id)}
              className={`relative flex min-w-[3.25rem] shrink-0 flex-1 items-center justify-center gap-1 px-1.5 py-3 text-[10px] font-medium transition sm:min-w-[4.5rem] sm:gap-1.5 sm:px-3 sm:py-3.5 sm:text-xs ${
                isActive
                  ? 'bg-gradient-to-t from-empire-gold/15 to-transparent text-empire-gold'
                  : 'text-slate-500 hover:bg-empire-surface/80 hover:text-slate-300'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="truncate">{label}</span>
              {showDot && (
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-empire-accent animate-pulse" />
              )}
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-empire-gold"
                />
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {active === 'career' && <CareerPanel />}
          {active === 'housing' && <HousingPanel />}
          {active === 'business' && <BusinessPanel />}
          {active === 'diary' && <LifeDiaryPanel />}
          {active === 'objectives' && <ObjectivesPanel />}
          {active === 'achievements' && <AchievementsPanel />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
