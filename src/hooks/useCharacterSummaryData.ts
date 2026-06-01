import { DIFFICULTY_MAP } from '../data/difficulties';
import { LIFE_PATH_MAP } from '../data/lifePaths';
import { ORIGIN_MAP } from '../data/origins';
import { TRAIT_MAP } from '../data/traits';
import { BUSINESS_MAP } from '../data/businesses';
import { useGameStore } from '../store/gameStore';
import { getCareer } from '../utils/careerLogic';
import { getHousing } from '../utils/housingLogic';
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

export function useCharacterSummaryData() {
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

  const relationshipLabel = getRelationshipDisplayLabel(
    relationshipStatus,
    partnerName,
  );

  const businessNames =
    ownedBusinessIds.length > 0
      ? ownedBusinessIds.map((id) => BUSINESS_MAP[id]?.name).join(' · ')
      : null;

  const summaries = [
    { label: 'Financeiro', value: getFinancialSituation(stats, assets) },
    { label: 'Saúde', value: getHealthSituation(stats) },
    { label: 'Emocional', value: getEmotionalSituation(stats) },
  ] as const;

  return {
    stats,
    time,
    characterName,
    phase,
    origin,
    trait,
    difficulty,
    career,
    housing,
    patrimony,
    workIncome,
    pathDef,
    pathPct,
    fame,
    fameTier,
    statusPhrase,
    relationshipLabel,
    relationshipScore,
    hasChildren,
    childrenCount,
    exhaustionCounter,
    ownedBusinessIds,
    businessNames,
    summaries,
    monthLabel: formatTime(time).split('·')[0].trim(),
  };
}
