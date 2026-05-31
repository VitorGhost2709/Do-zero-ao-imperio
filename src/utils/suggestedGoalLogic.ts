import { BUSINESS_MAP } from '../data/businesses';
import { HOUSING_MAP } from '../data/housing';
import { CAREER_MAP } from '../data/careers';
import type { GameState } from '../types/game';
import { getAvailableCareers, canPromoteToCareer } from './careerLogic';
import { canPurchaseBusiness, getBusinessLevel } from './businessLogic';
import { calculatePatrimony } from './gameLogic';
import { getPatrimonyContext } from './storage';

export interface SuggestedGoal {
  text: string;
  priority: 'critical' | 'high' | 'normal';
}

export function getSuggestedGoal(state: GameState): SuggestedGoal {
  const { stats } = state;

  if (stats.stress >= 80) {
    return { text: 'Cuidado: seu estresse está alto — descanse ou reduza o ritmo.', priority: 'critical' };
  }
  if (stats.energy <= 25) {
    return { text: 'Recupere sua energia acima de 70 antes de trabalhar de novo.', priority: 'critical' };
  }
  if (stats.physicalHealth <= 25 || stats.mentalHealth <= 25) {
    return { text: 'Sua saúde está crítica — descanse ou treine com cuidado.', priority: 'critical' };
  }
  if (stats.money < -200) {
    return { text: 'Você está endividado — trabalhe ou corte gastos até estabilizar.', priority: 'critical' };
  }

  if (stats.energy < 70 && stats.stress > 55) {
    return { text: 'Recupere sua energia acima de 70.', priority: 'high' };
  }

  const available = getAvailableCareers(
    stats,
    state.currentCareerId,
    state.traitId,
  );
  if (available.length > 0) {
    return {
      text: `Promoção disponível: ${available[0].name}!`,
      priority: 'high',
    };
  }

  const current = CAREER_MAP[state.currentCareerId];
  const nextId = current?.nextCareerIds[0];
  if (nextId) {
    const next = CAREER_MAP[nextId];
    const check = canPromoteToCareer(
      stats,
      nextId,
      state.currentCareerId,
      state.traitId,
    );
    if (!check.ok && next) {
      const missing: string[] = [];
      if (stats.intelligence < next.minIntelligence) {
        missing.push(`inteligência ${next.minIntelligence}`);
      }
      if (stats.charisma < next.minCharisma) {
        missing.push(`carisma ${next.minCharisma}`);
      }
      if (stats.reputation < next.minReputation) {
        missing.push(`reputação ${next.minReputation}`);
      }
      if (missing.length > 0) {
        return {
          text: `Estude e evolua para liberar: ${next.name} (${missing.join(', ')}).`,
          priority: 'normal',
        };
      }
    }
  }

  if (state.currentHousingId === 'simple_room' && stats.money >= 200) {
    const kitnet = HOUSING_MAP.kitnet_rent;
    return {
      text: `Junte dinheiro para sair do quarto simples (aluguel ~R$ ${kitnet.monthlyRent + kitnet.livingCostExtra}/mês).`,
      priority: 'normal',
    };
  }

  if (state.ownedBusinessIds.length === 0 && stats.money >= 350) {
    const first = Object.values(BUSINESS_MAP).find(
      (b) => canPurchaseBusiness(stats, b.id, []).ok,
    );
    if (first) {
      return { text: `Compre seu primeiro negócio: ${first.name}.`, priority: 'normal' };
    }
    return { text: 'Compre seu primeiro negócio para gerar renda passiva.', priority: 'normal' };
  }

  const upgradable = state.ownedBusinessIds.find((id) => {
    const level = getBusinessLevel(id, state.businessLevels);
    const biz = BUSINESS_MAP[id];
    return biz && level < biz.maxLevel;
  });
  if (upgradable) {
    const biz = BUSINESS_MAP[upgradable]!;
    const lvl = getBusinessLevel(upgradable, state.businessLevels);
    return {
      text: `Evolua ${biz.name} (nível ${lvl} → ${lvl + 1}) para aumentar renda passiva.`,
      priority: 'normal',
    };
  }

  const assets = getPatrimonyContext(state);
  const patrimony = calculatePatrimony(stats, assets);
  if (patrimony < 2000 && stats.money < 500) {
    return { text: 'Trabalhe com equilíbrio — descanse quando a energia baixar.', priority: 'normal' };
  }

  if (state.time.age >= 55 && !state.isRetired) {
    return {
      text: 'Você pode se aposentar aos 60+ e encerrar sua jornada com honra.',
      priority: 'normal',
    };
  }

  return { text: 'Mantenha equilíbrio entre dinheiro, saúde e reputação.', priority: 'normal' };
}
