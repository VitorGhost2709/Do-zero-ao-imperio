import { motion } from 'framer-motion';
import { useIsMobile } from '../hooks/useMediaQuery';
import { User, Briefcase, Home, Building2, Heart, Eye } from 'lucide-react';
import { DIFFICULTY_MAP } from '../data/difficulties';
import { LIFE_PATH_MAP } from '../data/lifePaths';
import { ORIGIN_MAP } from '../data/origins';
import { TRAIT_MAP } from '../data/traits';
import { useGameStore } from '../store/gameStore';
import { getCareer } from '../utils/careerLogic';
import { getHousing } from '../utils/housingLogic';
import { BUSINESS_MAP } from '../data/businesses';
import { getPatrimonyContext } from '../utils/storage';
import { getDominantLifePath, getLifePathProgress } from '../utils/lifePathLogic';
import { getRelationshipDisplayLabel } from '../utils/partnerLogic';
import { getFameTier } from '../utils/fameLogic';
import {
  calculatePatrimony,
  calculateWorkIncome,
  formatTime,
  getEmotionalSituation,
  getFinancialSituation,
  getGeneralStatusPhrase,
  getHealthSituation,
  getLifePhase,
} from '../utils/gameLogic';

export function CharacterSummary() {
  const isMobile = useIsMobile();
  const stats = useGameStore((s) => s.stats);
  const time = useGameStore((s) => s.time);
  const characterName = useGameStore((s) => s.characterName);
  const originId = useGameStore((s) => s.originId);
  const traitId = useGameStore((s) => s.traitId);
  const difficultyId = useGameStore((s) => s.difficultyId);
  const purchasedUpgrades = useGameStore((s) => s.purchasedUpgrades);
  const ownedHousingIds = useGameStore((s) => s.ownedHousingIds);
  const ownedBusinessIds = useGameStore((s) => s.ownedBusinessIds);
  const businessLevels = useGameStore((s) => s.businessLevels);
  const currentCareerId = useGameStore((s) => s.currentCareerId);
  const currentHousingId = useGameStore((s) => s.currentHousingId);
  const exhaustionCounter = useGameStore((s) => s.exhaustionCounter);
  const lifePathTracking = useGameStore((s) => s.lifePathTracking);
  const relationshipStatus = useGameStore((s) => s.relationshipStatus);
  const relationshipScore = useGameStore((s) => s.relationshipScore);
  const partnerName = useGameStore((s) => s.partnerName);
  const hasChildren = useGameStore((s) => s.hasChildren);
  const childrenCount = useGameStore((s) => s.childrenCount);
  const fame = useGameStore((s) => s.fame);

  const assets = getPatrimonyContext({
    purchasedUpgrades,
    ownedHousingIds,
    ownedBusinessIds,
    businessLevels,
  });
  const phase = getLifePhase(time.age);
  const origin = ORIGIN_MAP[originId];
  const trait = TRAIT_MAP[traitId];
  const difficulty = DIFFICULTY_MAP[difficultyId];
  const career = getCareer(currentCareerId);
  const housing = getHousing(currentHousingId);
  const patrimony = calculatePatrimony(stats, assets);
  const workIncome = calculateWorkIncome(
    currentCareerId,
    purchasedUpgrades,
    stats,
    difficultyId,
  );
  const dominantPath = getDominantLifePath(lifePathTracking);
  const pathDef = LIFE_PATH_MAP[dominantPath];
  const pathPct = getLifePathProgress(lifePathTracking, dominantPath);
  const fameTier = getFameTier(fame);

  const statusPhrase = getGeneralStatusPhrase(
    stats,
    time,
    assets,
    ownedBusinessIds,
    characterName,
  );

  const summaries = [
    {
      label: 'Financeiro',
      value: getFinancialSituation(stats, assets),
    },
    {
      label: 'Saúde',
      value: getHealthSituation(stats),
    },
    {
      label: 'Emocional',
      value: getEmotionalSituation(stats),
    },
  ];

  return (
    <motion.section
      className="empire-card max-w-full overflow-hidden p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <motion.div
          className="mx-auto flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-empire-accent/40 to-empire-gold/30 ring-2 ring-empire-border sm:mx-0"
          animate={isMobile ? undefined : { y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          <User className="h-8 w-8 text-slate-200" />
        </motion.div>

        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl font-bold text-white">{characterName}</h2>
          <p className="text-sm text-slate-400">
            {time.age} anos · {formatTime(time).split('·')[0].trim()}
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
            <span className="rounded-full bg-empire-accent/20 px-2.5 py-0.5 text-[11px] text-empire-accent">
              {origin.name}
            </span>
            <span className="rounded-full bg-empire-gold/20 px-2.5 py-0.5 text-[11px] text-empire-gold">
              {trait.name}
            </span>
            <span className="rounded-full bg-empire-surface px-2.5 py-0.5 text-[11px] text-slate-400">
              {phase.label}
            </span>
            <span className="rounded-full border border-empire-border px-2.5 py-0.5 text-[11px] text-slate-400">
              {difficulty.name}
            </span>
            <span className="rounded-full border border-indigo-500/40 bg-indigo-500/15 px-2.5 py-0.5 text-[11px] text-indigo-200">
              {pathDef.name} ({pathPct}%)
            </span>
            {exhaustionCounter > 0 && (
              <span className="rounded-full bg-orange-500/20 px-2.5 py-0.5 text-[11px] text-orange-300">
                Exaustão {exhaustionCounter}/3
              </span>
            )}
          </div>
        </div>
      </div>

      <blockquote className="mt-4 rounded-xl border border-empire-border/80 bg-empire-surface/80 px-4 py-3 text-sm italic leading-relaxed text-slate-300">
        "{statusPhrase}"
      </blockquote>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="flex min-w-0 items-center gap-2 rounded-lg border border-empire-border/50 bg-empire-surface/80 px-3 py-2 text-xs">
          <Heart className="h-3.5 w-3.5 shrink-0 text-rose-400" />
          <span className="min-w-0 break-words text-slate-400">
            {getRelationshipDisplayLabel(relationshipStatus, partnerName)} ·{' '}
            {relationshipScore}/100
            {hasChildren && childrenCount > 0
              ? ` · ${childrenCount} filho(s)`
              : ''}
          </span>
        </div>
        <div className="flex min-w-0 items-center gap-2 rounded-lg border border-empire-border/50 bg-empire-surface/80 px-3 py-2 text-xs">
          <Eye className="h-3.5 w-3.5 shrink-0 text-violet-400" />
          <span className="min-w-0 break-words text-slate-400">
            Fama {fame} · {fameTier.label}
          </span>
        </div>
        <div className="min-w-0 rounded-lg border border-empire-border/50 bg-empire-surface/80 px-3 py-2 text-[10px] leading-snug text-slate-500">
          <span className="line-clamp-3 break-words">{pathDef.description}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 rounded-xl bg-empire-surface p-3 text-center sm:grid-cols-3">
        <div className="min-w-0 px-1">
          <p className="text-[10px] uppercase text-slate-500">Dinheiro</p>
          <p className="truncate text-sm font-bold text-empire-gold">
            R$ {stats.money.toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="min-w-0 px-1">
          <p className="text-[10px] uppercase text-slate-500">Patrimônio</p>
          <p className="truncate text-sm font-bold text-white">
            R$ {patrimony.toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="min-w-0 px-1">
          <p className="text-[10px] uppercase text-slate-500">Trabalho</p>
          <p className="truncate text-sm font-bold text-empire-success">
            R$ {workIncome}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
        <div className="flex items-center gap-2 rounded-lg bg-empire-surface/80 px-3 py-2 text-slate-400">
          <Briefcase className="h-3.5 w-3.5 text-empire-accent" />
          {career.name}
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-empire-surface/80 px-3 py-2 text-slate-400">
          <Home className="h-3.5 w-3.5 text-empire-gold" />
          {housing.name}
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-empire-surface/80 px-3 py-2 text-slate-400">
          <Building2 className="h-3.5 w-3.5 text-empire-success" />
          {ownedBusinessIds.length === 0
            ? 'Sem negócios'
            : `${ownedBusinessIds.length} negócio(s)`}
        </div>
      </div>

      {ownedBusinessIds.length > 0 && (
        <p className="mt-2 text-[10px] text-slate-600">
          {ownedBusinessIds.map((id) => BUSINESS_MAP[id]?.name).join(' · ')}
        </p>
      )}

      <div className="mt-3 space-y-1.5">
        {summaries.map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-col gap-0.5 rounded-lg border border-empire-border/50 px-3 py-1.5 text-xs sm:flex-row sm:justify-between sm:gap-2"
          >
            <span className="shrink-0 text-slate-500">{label}</span>
            <span className="min-w-0 break-words text-slate-300 sm:text-right">
              {value}
            </span>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
