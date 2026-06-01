import type { GameAction } from '../types/game';

export const ACTIONS: GameAction[] = [
  {
    id: 'work',
    name: 'Trabalhar',
    description:
      'Ganhe dinheiro, mas perca energia e aumente o estresse. Cuidado se a energia estiver baixa.',
    icon: 'Briefcase',
    effects: {
      money: 50,
      energy: -18,
      stress: 10,
    },
  },
  {
    id: 'study',
    name: 'Estudar',
    description:
      'Aumente inteligência e estresse. Com saúde mental baixa, o aprendizado rende menos.',
    icon: 'BookOpen',
    effects: {
      intelligence: 6,
      energy: -10,
      stress: 6,
    },
  },
  {
    id: 'rest',
    name: 'Descansar',
    description:
      'Recupere energia, reduza estresse e cuide da saúde mental. Essencial para sobreviver.',
    icon: 'Moon',
    effects: {
      energy: 28,
      stress: -14,
      mentalHealth: 6,
      happiness: 4,
    },
  },
  {
    id: 'socialize',
    name: 'Socializar',
    description:
      'Melhore felicidade e carisma, alivie o estresse, mas gaste dinheiro e energia.',
    icon: 'Users',
    effects: {
      happiness: 10,
      charisma: 6,
      stress: -8,
      money: -25,
      energy: -8,
    },
  },
  {
    id: 'train',
    name: 'Treinar',
    description:
      'Melhore saúde física e reduza estresse. Com pouca energia, risco de lesão.',
    icon: 'Dumbbell',
    effects: {
      physicalHealth: 8,
      energy: -14,
      stress: -6,
      happiness: 3,
    },
  },
  {
    id: 'invest',
    name: 'Investir',
    description:
      'Chance de lucro ou prejuízo. Inteligência alta melhora suas chances.',
    icon: 'TrendingUp',
    effects: {
      stress: 12,
    },
  },
];

export const ACTION_MAP = Object.fromEntries(
  ACTIONS.map((a) => [a.id, a]),
) as Record<string, GameAction>;
