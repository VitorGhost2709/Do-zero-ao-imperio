import { HOUSING_MAP, HOUSING_OPTIONS } from '../data/housing';
import type { CharacterStats, Housing } from '../types/game';

export function getHousing(id: string): Housing {
  return HOUSING_MAP[id] ?? HOUSING_MAP.simple_room;
}

export function canRentHousing(
  stats: CharacterStats,
  housingId: string,
): { ok: boolean; reason?: string } {
  const housing = getHousing(housingId);
  if (housing.type !== 'rent') {
    return { ok: false, reason: 'Esta moradia não é para aluguel.' };
  }
  if (stats.money < housing.monthlyRent * 2) {
    return {
      ok: false,
      reason: 'Precisa de reserva para pelo menos 2 meses de aluguel.',
    };
  }
  return { ok: true };
}

export function canPurchaseHousing(
  stats: CharacterStats,
  housingId: string,
  ownedHousingIds: string[],
): { ok: boolean; reason?: string } {
  const housing = getHousing(housingId);
  if (housing.type !== 'owned' || housing.purchaseCost <= 0) {
    return { ok: false, reason: 'Não disponível para compra.' };
  }
  if (ownedHousingIds.includes(housingId)) {
    return { ok: false, reason: 'Você já possui este imóvel.' };
  }
  if (stats.money < housing.purchaseCost) {
    return { ok: false, reason: `Custo: R$ ${housing.purchaseCost}.` };
  }
  return { ok: true };
}

export function getPurchasableHousing(ownedHousingIds: string[]): Housing[] {
  return HOUSING_OPTIONS.filter(
    (h) => h.purchaseCost > 0 && !ownedHousingIds.includes(h.id),
  );
}

export function getRentableHousing(): Housing[] {
  return HOUSING_OPTIONS.filter((h) => h.type === 'rent');
}

export function getOwnedHousingOptions(ownedHousingIds: string[]): Housing[] {
  return ownedHousingIds
    .map((id) => HOUSING_MAP[id])
    .filter(Boolean);
}
