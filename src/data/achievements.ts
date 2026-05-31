import type { Achievement } from '../types/game';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_salary',
    title: 'Primeiro salário',
    description: 'Trabalhou pela primeira vez e recebeu.',
    conditionType: 'worked_once',
    reward: { reputation: 3, happiness: 3 },
  },
  {
    id: 'survived_burnout',
    title: 'Sobreviveu ao burnout',
    description: 'Passou por burnout e continuou vivo.',
    conditionType: 'had_burnout',
    reward: { mentalHealth: 5, reputation: 4 },
  },
  {
    id: 'nearly_died',
    title: 'Quase morreu',
    description: 'Chegou à beira da morte (saúde física crítica).',
    conditionType: 'near_death',
    reward: { reputation: 2 },
  },
  {
    id: 'rich_before_30',
    title: 'Rico antes dos 30',
    description: 'Patrimônio acima de R$ 5.000 antes dos 30 anos.',
    conditionType: 'rich_young',
    reward: { reputation: 8, happiness: 5 },
  },
  {
    id: 'business_mogul',
    title: 'Magnata dos negócios',
    description: 'Possui 3 ou mais negócios.',
    conditionType: 'business_count_gte',
    conditionValue: 3,
    reward: { reputation: 10, money: 150 },
  },
  {
    id: 'study_master',
    title: 'Mestre dos estudos',
    description: 'Inteligência acima de 90.',
    conditionType: 'intelligence_gte',
    conditionValue: 90,
    reward: { intelligence: 2, reputation: 5 },
  },
  {
    id: 'balanced_life',
    title: 'Vida equilibrada',
    description: 'Felicidade, saúdes altas e estresse baixo.',
    conditionType: 'balanced_stats',
    reward: { happiness: 8, stress: -8 },
  },
  {
    id: 'workaholic',
    title: 'Workaholic',
    description: 'Trabalhou 25 vezes ou mais.',
    conditionType: 'work_count_gte',
    conditionValue: 25,
    reward: { money: 100, stress: 5 },
  },
  {
    id: 'lucky_investor',
    title: 'Investidor de sorte',
    description: 'Teve 3 investimentos lucrativos.',
    conditionType: 'invest_wins_gte',
    conditionValue: 3,
    reward: { happiness: 6, reputation: 4 },
  },
  {
    id: 'debt_king',
    title: 'Rei da dívida',
    description: 'Ficou com dinheiro abaixo de -R$ 300.',
    conditionType: 'had_heavy_debt',
    reward: { reputation: -2 },
  },
  {
    id: 'comeback',
    title: 'Deu a volta por cima',
    description: 'Esteve endividado e depois patrimônio passou de R$ 2.000.',
    conditionType: 'comeback',
    reward: { reputation: 12, happiness: 10 },
  },
];

export const ACHIEVEMENT_MAP = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
) as Record<string, Achievement>;
