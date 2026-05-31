import { BUSINESS_MAP, BUSINESSES } from '../data/businesses';
import type { Business, CharacterStats } from '../types/game';

export function getBusiness(id: string): Business | undefined {
  return BUSINESS_MAP[id];
}

export function getBusinessLevel(
  businessId: string,
  businessLevels: Record<string, number>,
): number {
  return businessLevels[businessId] ?? 1;
}

export function getBusinessMonthlyIncome(
  businessId: string,
  businessLevels: Record<string, number>,
): number {
  const biz = getBusiness(businessId);
  if (!biz) return 0;
  const level = getBusinessLevel(businessId, businessLevels);
  const idx = Math.min(level - 1, biz.incomeByLevel.length - 1);
  return biz.incomeByLevel[idx] ?? biz.monthlyIncome;
}

export function getBusinessProblemChance(
  businessId: string,
  businessLevels: Record<string, number>,
): number {
  const biz = getBusiness(businessId);
  if (!biz) return 0;
  const level = getBusinessLevel(businessId, businessLevels);
  const idx = Math.min(level - 1, biz.problemChanceByLevel.length - 1);
  return biz.problemChanceByLevel[idx] ?? biz.problemChance;
}

export function getBusinessOperatingCost(
  businessId: string,
  businessLevels: Record<string, number>,
): number {
  const biz = getBusiness(businessId);
  if (!biz) return 0;
  const level = getBusinessLevel(businessId, businessLevels);
  const idx = Math.min(level - 1, biz.operatingCostByLevel.length - 1);
  return biz.operatingCostByLevel[idx] ?? 0;
}

export function getBusinessAssetValue(
  businessId: string,
  businessLevels: Record<string, number>,
): number {
  const biz = getBusiness(businessId);
  if (!biz) return 0;
  const level = getBusinessLevel(businessId, businessLevels);
  let value = biz.cost;
  for (let i = 0; i < level - 1; i++) {
    value += biz.upgradeCosts[i] ?? 0;
  }
  return value;
}

export function canPurchaseBusiness(
  stats: CharacterStats,
  businessId: string,
  ownedBusinessIds: string[],
): { ok: boolean; reason?: string } {
  const biz = getBusiness(businessId);
  if (!biz) return { ok: false, reason: 'Negócio não encontrado.' };
  if (ownedBusinessIds.includes(businessId)) {
    return { ok: false, reason: 'Você já possui este negócio.' };
  }
  if (stats.money < biz.cost) {
    return { ok: false, reason: `Custo: R$ ${biz.cost}.` };
  }
  if (stats.intelligence < biz.minIntelligence) {
    return { ok: false, reason: `Inteligência mín.: ${biz.minIntelligence}.` };
  }
  if (stats.charisma < biz.minCharisma) {
    return { ok: false, reason: `Carisma mín.: ${biz.minCharisma}.` };
  }
  if (stats.reputation < biz.minReputation) {
    return { ok: false, reason: `Reputação mín.: ${biz.minReputation}.` };
  }
  return { ok: true };
}

export function canUpgradeBusiness(
  stats: CharacterStats,
  businessId: string,
  ownedBusinessIds: string[],
  businessLevels: Record<string, number>,
): { ok: boolean; reason?: string; cost?: number; nextLevel?: number } {
  if (!ownedBusinessIds.includes(businessId)) {
    return { ok: false, reason: 'Você não possui este negócio.' };
  }
  const biz = getBusiness(businessId);
  if (!biz) return { ok: false, reason: 'Negócio não encontrado.' };

  const level = getBusinessLevel(businessId, businessLevels);
  if (level >= biz.maxLevel) {
    return { ok: false, reason: 'Nível máximo atingido.' };
  }

  const cost = biz.upgradeCosts[level - 1];
  if (cost === undefined) {
    return { ok: false, reason: 'Evolução indisponível.' };
  }
  if (stats.money < cost) {
    return { ok: false, reason: `Custo da evolução: R$ ${cost}.` };
  }

  return { ok: true, cost, nextLevel: level + 1 };
}

export function getAvailableBusinesses(
  stats: CharacterStats,
  ownedBusinessIds: string[],
): Business[] {
  return BUSINESSES.filter(
    (b) =>
      !ownedBusinessIds.includes(b.id) &&
      canPurchaseBusiness(stats, b.id, ownedBusinessIds).ok,
  );
}
