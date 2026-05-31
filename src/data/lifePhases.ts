import type { LifePhase } from '../types/game';

export const LIFE_PHASES: LifePhase[] = [
  { id: 'starting', label: 'Começando a vida', minAge: 18, maxAge: 21 },
  { id: 'career', label: 'Construindo carreira', minAge: 22, maxAge: 29 },
  { id: 'expansion', label: 'Expansão', minAge: 30, maxAge: 39 },
  { id: 'consolidation', label: 'Consolidação', minAge: 40, maxAge: 59 },
  { id: 'legacy', label: 'Legado', minAge: 60, maxAge: 120 },
];
