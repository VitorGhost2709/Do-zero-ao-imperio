import type { TraitId } from '../types/game';

export interface TraitDefinition {
  id: TraitId;
  name: string;
  description: string;
  pros: string;
  cons: string;
}

export const TRAITS: TraitDefinition[] = [
  {
    id: 'ambitious',
    name: 'Ambicioso',
    description: 'Fome de crescimento a qualquer custo.',
    pros: '+15% dinheiro ao trabalhar',
    cons: '+estresse ao trabalhar',
  },
  {
    id: 'disciplined',
    name: 'Disciplinado',
    description: 'Foco em estudo e treino.',
    pros: 'Estudar e treinar rendem mais',
    cons: 'Socializar rende menos felicidade',
  },
  {
    id: 'charismatic',
    name: 'Carismático',
    description: 'Natural em conexões humanas.',
    pros: 'Socializar e carreira social melhoram',
    cons: 'Estudo rende um pouco menos',
  },
  {
    id: 'intelligent',
    name: 'Inteligente',
    description: 'Mente afiada para aprender e investir.',
    pros: 'Estudo e investimentos melhores',
    cons: 'Trabalho físico cansa mais',
  },
  {
    id: 'lucky',
    name: 'Sortudo',
    description: 'A sorte sorri de vez em quando.',
    pros: 'Eventos positivos mais frequentes',
    cons: 'Salário base levemente menor',
  },
  {
    id: 'impulsive',
    name: 'Impulsivo',
    description: 'Arrisca grande — ganha ou perde forte.',
    pros: 'Investimentos com maior upside',
    cons: 'Prejuízos maiores e mais estresse',
  },
  {
    id: 'resilient',
    name: 'Resiliente',
    description: 'Aguenta pressão melhor que a maioria.',
    pros: 'Crises e burnout machucam menos',
    cons: 'Descanso recupera menos energia',
  },
];

export const TRAIT_MAP = Object.fromEntries(
  TRAITS.map((t) => [t.id, t]),
) as Record<TraitId, TraitDefinition>;
