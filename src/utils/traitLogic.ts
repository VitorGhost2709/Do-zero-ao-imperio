import type { ActionId, StatDelta, TraitId } from '../types/game';

export function applyTraitToActionEffects(
  actionId: ActionId,
  effects: StatDelta,
  traitId: TraitId,
): StatDelta {
  const next = { ...effects };

  switch (traitId) {
    case 'ambitious':
      if (actionId === 'work' && next.money) {
        next.money = Math.round(next.money * 1.15);
        next.stress = (next.stress ?? 0) + 4;
      }
      break;
    case 'disciplined':
      if (actionId === 'study' && next.intelligence) {
        next.intelligence = Math.round(next.intelligence * 1.2);
      }
      if (actionId === 'train' && next.physicalHealth) {
        next.physicalHealth = Math.round(next.physicalHealth * 1.15);
      }
      if (actionId === 'socialize' && next.happiness) {
        next.happiness = Math.round(next.happiness * 0.85);
      }
      break;
    case 'charismatic':
      if (actionId === 'socialize') {
        if (next.charisma) next.charisma = Math.round(next.charisma * 1.25);
        if (next.happiness) next.happiness = Math.round(next.happiness * 1.15);
      }
      if (actionId === 'study' && next.intelligence) {
        next.intelligence = Math.round(next.intelligence * 0.9);
      }
      break;
    case 'intelligent':
      if (actionId === 'study' && next.intelligence) {
        next.intelligence = Math.round(next.intelligence * 1.25);
      }
      if (actionId === 'work') {
        next.energy = (next.energy ?? 0) - 2;
      }
      break;
    case 'lucky':
      if (actionId === 'work' && next.money) {
        next.money = Math.round(next.money * 0.95);
      }
      break;
    case 'impulsive':
      if (actionId === 'invest' && next.money) {
        next.money = Math.round(next.money * 1.35);
        next.stress = (next.stress ?? 0) + 5;
      }
      break;
    case 'resilient':
      if (actionId === 'rest' && next.energy) {
        next.energy = Math.round(next.energy * 0.9);
      }
      break;
  }

  return next;
}

export function applyTraitToConsequenceDelta(
  delta: StatDelta,
  traitId: TraitId,
): StatDelta {
  if (traitId !== 'resilient') return delta;

  const scaled: StatDelta = {};
  (Object.keys(delta) as (keyof StatDelta)[]).forEach((key) => {
    const v = delta[key];
    if (v === undefined) return;
    if (key === 'money') {
      scaled[key] = Math.round(v * 0.75);
    } else if (v < 0) {
      scaled[key] = Math.round(v * 0.7);
    } else {
      scaled[key] = v;
    }
  });
  return scaled;
}

export function getInvestTraitBonus(traitId: TraitId): number {
  if (traitId === 'intelligent') return 0.12;
  if (traitId === 'lucky') return 0.1;
  if (traitId === 'impulsive') return 0.05;
  return 0;
}

export function getCharismaCareerBonus(traitId: TraitId): number {
  return traitId === 'charismatic' ? 5 : 0;
}
