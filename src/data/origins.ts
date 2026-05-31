import type { OriginId, StatDelta } from '../types/game';

export interface OriginDefinition {
  id: OriginId;
  name: string;
  description: string;
  narrativePhrase: string;
  statModifiers: StatDelta;
}

export const ORIGINS: OriginDefinition[] = [
  {
    id: 'humble',
    name: 'Humilde',
    description: 'Cresceu com pouco, mas com coração forte e reputação na comunidade.',
    narrativePhrase:
      'você nasceu humilde e aprendeu cedo que cada centavo exige suor.',
    statModifiers: {
      money: -40,
      reputation: 12,
      stress: 8,
      happiness: -3,
    },
  },
  {
    id: 'middle_class',
    name: 'Classe média',
    description: 'Infância estável, sem luxo nem privação extrema.',
    narrativePhrase:
      'você veio da classe média — equilíbrio no começo, pressão para crescer.',
    statModifiers: {
      money: 0,
      reputation: 0,
      stress: 0,
      happiness: 0,
    },
  },
  {
    id: 'privileged',
    name: 'Privilegiado',
    description: 'Portas abertas desde cedo, mas expectativas e julgamentos maiores.',
    narrativePhrase:
      'você nasceu privilegiado: mais dinheiro no bolso, menos paciência ao redor.',
    statModifiers: {
      money: 80,
      reputation: -8,
      happiness: 10,
      stress: 3,
    },
  },
];

export const ORIGIN_MAP = Object.fromEntries(
  ORIGINS.map((o) => [o.id, o]),
) as Record<OriginId, OriginDefinition>;
