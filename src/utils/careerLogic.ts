import { CAREER_MAP, CAREERS } from '../data/careers';
import type { Career, CharacterStats, TraitId } from '../types/game';
import { MIN_REPUTATION_FOR_PROMOTION } from '../types/game';
import { getCharismaCareerBonus } from './traitLogic';

export function getCareer(id: string): Career {
  return CAREER_MAP[id] ?? CAREER_MAP.unemployed;
}

export function meetsCareerRequirements(
  stats: CharacterStats,
  career: Career,
  traitId?: TraitId,
): boolean {
  const charismaBonus = traitId ? getCharismaCareerBonus(traitId) : 0;
  return (
    stats.intelligence >= career.minIntelligence &&
    stats.charisma + charismaBonus >= career.minCharisma &&
    stats.reputation >= career.minReputation
  );
}

export interface MissingRequirement {
  label: string;
  current: number;
  required: number;
}

export function getMissingCareerRequirements(
  stats: CharacterStats,
  careerId: string,
  traitId?: TraitId,
): MissingRequirement[] {
  const career = getCareer(careerId);
  const charismaBonus = traitId ? getCharismaCareerBonus(traitId) : 0;
  const missing: MissingRequirement[] = [];

  if (stats.intelligence < career.minIntelligence) {
    missing.push({
      label: 'Inteligência',
      current: stats.intelligence,
      required: career.minIntelligence,
    });
  }
  if (stats.charisma + charismaBonus < career.minCharisma) {
    missing.push({
      label: 'Carisma',
      current: stats.charisma + charismaBonus,
      required: career.minCharisma,
    });
  }
  if (stats.reputation < career.minReputation) {
    missing.push({
      label: 'Reputação',
      current: stats.reputation,
      required: career.minReputation,
    });
  }
  if (
    career.id !== 'attendant' &&
    career.id !== 'unemployed' &&
    stats.reputation < MIN_REPUTATION_FOR_PROMOTION
  ) {
    missing.push({
      label: 'Reputação (promoção)',
      current: stats.reputation,
      required: MIN_REPUTATION_FOR_PROMOTION,
    });
  }
  if (stats.money < career.entryCost) {
    missing.push({
      label: 'Dinheiro (entrada)',
      current: stats.money,
      required: career.entryCost,
    });
  }

  return missing;
}

export function canPromoteToCareer(
  stats: CharacterStats,
  careerId: string,
  currentCareerId: string,
  traitId?: TraitId,
): { ok: boolean; reason?: string } {
  const career = getCareer(careerId);
  const current = getCareer(currentCareerId);

  const isNext = current.nextCareerIds.includes(careerId);
  const isFromUnemployed =
    currentCareerId === 'unemployed' &&
    ['attendant', 'salesperson'].includes(careerId);

  if (!isNext && !isFromUnemployed) {
    return { ok: false, reason: 'Carreira não disponível neste momento.' };
  }

  if (
    career.id !== 'attendant' &&
    career.id !== 'unemployed' &&
    stats.reputation < MIN_REPUTATION_FOR_PROMOTION
  ) {
    return {
      ok: false,
      reason: `Reputação muito baixa (mín. ${MIN_REPUTATION_FOR_PROMOTION}).`,
    };
  }

  if (!meetsCareerRequirements(stats, career, traitId)) {
    const missing = getMissingCareerRequirements(stats, careerId, traitId);
    if (missing.length > 0) {
      const first = missing[0];
      return {
        ok: false,
        reason: `${first.label}: ${first.current}/${first.required}.`,
      };
    }
    return { ok: false, reason: 'Requisitos de atributos não atendidos.' };
  }

  if (stats.money < career.entryCost) {
    return {
      ok: false,
      reason: `Custo de entrada: R$ ${career.entryCost}.`,
    };
  }

  return { ok: true };
}

export function getAvailableCareers(
  stats: CharacterStats,
  currentCareerId: string,
  traitId?: TraitId,
): Career[] {
  const current = getCareer(currentCareerId);
  const candidateIds = new Set([
    ...current.nextCareerIds,
    ...(currentCareerId === 'unemployed'
      ? ['attendant', 'salesperson']
      : []),
  ]);

  return CAREERS.filter((c) => {
    if (c.id === currentCareerId) return false;
    if (!candidateIds.has(c.id)) return false;
    return canPromoteToCareer(stats, c.id, currentCareerId, traitId).ok;
  });
}

export function getUpcomingCareers(currentCareerId: string): Career[] {
  const current = getCareer(currentCareerId);
  const ids = new Set([
    ...current.nextCareerIds,
    ...(currentCareerId === 'unemployed'
      ? ['attendant', 'salesperson']
      : []),
  ]);
  return CAREERS.filter((c) => ids.has(c.id) && c.id !== currentCareerId);
}
