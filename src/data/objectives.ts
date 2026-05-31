import type { Objective } from '../types/game';

export const OBJECTIVES: Objective[] = [
  {
    id: 'save_1000',
    title: 'Primeira reserva',
    description: 'Junte R$ 1.000 em dinheiro.',
    conditionType: 'money_gte',
    conditionValue: 1000,
    reward: { money: 80, happiness: 5 },
  },
  {
    id: 'first_promotion',
    title: 'Primeiro emprego',
    description: 'Saia do desemprego e consiga uma carreira.',
    conditionType: 'career_not',
    conditionValue: 'unemployed',
    reward: { reputation: 8, money: 50 },
  },
  {
    id: 'first_upgrade',
    title: 'Investir em você',
    description: 'Compre seu primeiro upgrade na loja.',
    conditionType: 'upgrade_count_gte',
    conditionValue: 1,
    reward: { intelligence: 3, happiness: 5 },
  },
  {
    id: 'leave_simple_room',
    title: 'Independência',
    description: 'Saia do quarto simples (alugue ou compre outra moradia).',
    conditionType: 'housing_not',
    conditionValue: 'simple_room',
    reward: { happiness: 10, reputation: 5 },
  },
  {
    id: 'first_business',
    title: 'Espírito empreendedor',
    description: 'Compre seu primeiro negócio.',
    conditionType: 'business_count_gte',
    conditionValue: 1,
    reward: { money: 120, reputation: 6 },
  },
  {
    id: 'patrimony_10k',
    title: 'Patrimônio sólido',
    description: 'Alcance R$ 10.000 de patrimônio estimado.',
    conditionType: 'patrimony_gte',
    conditionValue: 10000,
    reward: { money: 200, reputation: 10 },
  },
  {
    id: 'age_25_alive',
    title: 'Quarto de século',
    description: 'Chegue aos 25 anos com vida.',
    conditionType: 'age_gte',
    conditionValue: 25,
    reward: { happiness: 12, stress: -10 },
  },
  {
    id: 'mental_80',
    title: 'Mente saudável',
    description: 'Mantenha saúde mental acima de 80.',
    conditionType: 'mental_health_gte',
    conditionValue: 80,
    reward: { mentalHealth: 5, happiness: 8 },
  },
  {
    id: 'become_businessman',
    title: 'Topo da carreira',
    description: 'Torne-se Empresário.',
    conditionType: 'career_is',
    conditionValue: 'businessman',
    reward: { money: 300, reputation: 15 },
  },
  {
    id: 'buy_mansion',
    title: 'Vida de magnata',
    description: 'Compre uma mansão.',
    conditionType: 'owns_housing',
    conditionValue: 'mansion',
    reward: { happiness: 20, reputation: 12 },
  },
];

export const OBJECTIVE_MAP = Object.fromEntries(
  OBJECTIVES.map((o) => [o.id, o]),
) as Record<string, Objective>;
