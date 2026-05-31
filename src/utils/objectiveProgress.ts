import type { GameState, Objective } from '../types/game';
import { calculatePatrimony } from './gameLogic';
import { getPatrimonyContext } from './storage';

export interface ObjectiveProgress {
  hasProgress: boolean;
  current: number;
  target: number;
  label: string;
  percent: number;
}

export function getObjectiveProgress(
  objective: Objective,
  state: GameState,
): ObjectiveProgress | null {
  const { stats } = state;
  const assets = getPatrimonyContext(state);
  const patrimony = calculatePatrimony(stats, assets);

  switch (objective.conditionType) {
    case 'money_gte': {
      const target = objective.conditionValue as number;
      return {
        hasProgress: true,
        current: Math.max(0, stats.money),
        target,
        label: `R$ ${Math.max(0, stats.money).toLocaleString('pt-BR')} / R$ ${target.toLocaleString('pt-BR')}`,
        percent: Math.min(100, (Math.max(0, stats.money) / target) * 100),
      };
    }
    case 'patrimony_gte': {
      const target = objective.conditionValue as number;
      return {
        hasProgress: true,
        current: patrimony,
        target,
        label: `Patrimônio R$ ${patrimony.toLocaleString('pt-BR')} / R$ ${target.toLocaleString('pt-BR')}`,
        percent: Math.min(100, (patrimony / target) * 100),
      };
    }
    case 'business_count_gte': {
      const target = objective.conditionValue as number;
      const current = state.ownedBusinessIds.length;
      return {
        hasProgress: true,
        current,
        target,
        label: `${current} / ${target} negócios`,
        percent: Math.min(100, (current / target) * 100),
      };
    }
    case 'upgrade_count_gte': {
      const target = objective.conditionValue as number;
      const current = state.purchasedUpgrades.length;
      return {
        hasProgress: true,
        current,
        target,
        label: `${current} / ${target} upgrades`,
        percent: Math.min(100, (current / target) * 100),
      };
    }
    case 'age_gte': {
      const target = objective.conditionValue as number;
      return {
        hasProgress: true,
        current: state.time.age,
        target,
        label: `${state.time.age} / ${target} anos`,
        percent: Math.min(100, (state.time.age / target) * 100),
      };
    }
    case 'mental_health_gte': {
      const target = objective.conditionValue as number;
      return {
        hasProgress: true,
        current: stats.mentalHealth,
        target,
        label: `Saúde mental ${stats.mentalHealth} / ${target}`,
        percent: Math.min(100, (stats.mentalHealth / target) * 100),
      };
    }
    case 'career_not':
      return {
        hasProgress: true,
        current: state.currentCareerId === 'unemployed' ? 0 : 1,
        target: 1,
        label:
          state.currentCareerId === 'unemployed'
            ? 'Ainda desempregado'
            : 'Carreira obtida',
        percent: state.currentCareerId === 'unemployed' ? 0 : 100,
      };
    case 'housing_not':
      return {
        hasProgress: true,
        current: state.currentHousingId === 'simple_room' ? 0 : 1,
        target: 1,
        label:
          state.currentHousingId === 'simple_room'
            ? 'Ainda no quarto simples'
            : 'Moradia melhorada',
        percent: state.currentHousingId === 'simple_room' ? 0 : 100,
      };
    case 'owns_housing':
      return {
        hasProgress: true,
        current: state.ownedHousingIds.includes(
          objective.conditionValue as string,
        )
          ? 1
          : 0,
        target: 1,
        label: state.ownedHousingIds.includes(
          objective.conditionValue as string,
        )
          ? 'Mansão adquirida'
          : 'Mansão não adquirida',
        percent: state.ownedHousingIds.includes(
          objective.conditionValue as string,
        )
          ? 100
          : 0,
      };
    case 'career_is':
      return {
        hasProgress: true,
        current: state.currentCareerId === objective.conditionValue ? 1 : 0,
        target: 1,
        label:
          state.currentCareerId === objective.conditionValue
            ? 'Meta de carreira atingida'
            : 'Carreira em progresso',
        percent:
          state.currentCareerId === objective.conditionValue ? 100 : 0,
      };
    default:
      return null;
  }
}
