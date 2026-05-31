import type { Upgrade } from '../types/game';

export const UPGRADES: Upgrade[] = [
  {
    id: 'notebook',
    name: 'Notebook usado',
    description: 'Aumenta o dinheiro ganho ao trabalhar em 50%.',
    cost: 180,
    effectKey: 'workBonus',
  },
  {
    id: 'online_course',
    name: 'Curso online',
    description: 'Aumenta o ganho de inteligência ao estudar em 50%.',
    cost: 320,
    effectKey: 'studyBonus',
  },
  {
    id: 'comfortable_bed',
    name: 'Cama confortável',
    description: 'Melhora a recuperação de energia ao descansar em 50%.',
    cost: 250,
    effectKey: 'restBonus',
  },
  {
    id: 'better_clothes',
    name: 'Roupa melhor',
    description: 'Melhora o ganho de carisma ao socializar em 50%.',
    cost: 130,
    effectKey: 'socialBonus',
  },
  {
    id: 'gym_plan',
    name: 'Plano de academia',
    description: 'Melhora o ganho de saúde física ao treinar em 50%.',
    cost: 360,
    effectKey: 'trainBonus',
  },
];
