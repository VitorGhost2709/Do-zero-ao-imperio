import type { DifficultyId } from '../types/game';

export interface DifficultyDefinition {
  id: DifficultyId;
  name: string;
  description: string;
  billsMultiplier: number;
  expenseMultiplier: number;
  stressGainMultiplier: number;
  /** Multiplicador para redução de estresse em ações (valores negativos) */
  stressReliefMultiplier: number;
  actionEnergyDrainMultiplier: number;
  rewardMultiplier: number;
  negativeEventBias: number;
  positiveEventBias: number;
  rareEventChance: number;
  burnoutThreshold: number;
}

export const DIFFICULTIES: DifficultyDefinition[] = [
  {
    id: 'normal',
    name: 'Normal',
    description: 'Experiência equilibrada — ideal para aprender o jogo.',
    billsMultiplier: 1,
    expenseMultiplier: 1,
    stressGainMultiplier: 1,
    stressReliefMultiplier: 1.2,
    actionEnergyDrainMultiplier: 1,
    rewardMultiplier: 1,
    negativeEventBias: 0,
    positiveEventBias: 0,
    rareEventChance: 0.06,
    burnoutThreshold: 3,
  },
  {
    id: 'hard',
    name: 'Difícil',
    description: 'Contas mais pesadas, estresse maior e recompensas menores.',
    billsMultiplier: 1.12,
    expenseMultiplier: 1.08,
    stressGainMultiplier: 1.1,
    stressReliefMultiplier: 1,
    actionEnergyDrainMultiplier: 1.05,
    rewardMultiplier: 0.92,
    negativeEventBias: 0.1,
    positiveEventBias: -0.05,
    rareEventChance: 0.055,
    burnoutThreshold: 3,
  },
  {
    id: 'survival',
    name: 'Sobrevivência',
    description: 'Cada mês conta. Burnout mais perigoso; conquistas valem mais.',
    billsMultiplier: 1.28,
    expenseMultiplier: 1.15,
    stressGainMultiplier: 1.22,
    stressReliefMultiplier: 0.85,
    actionEnergyDrainMultiplier: 1.15,
    rewardMultiplier: 0.85,
    negativeEventBias: 0.18,
    positiveEventBias: -0.1,
    rareEventChance: 0.045,
    burnoutThreshold: 2,
  },
];

export const DIFFICULTY_MAP = Object.fromEntries(
  DIFFICULTIES.map((d) => [d.id, d]),
) as Record<DifficultyId, DifficultyDefinition>;

export const DEFAULT_DIFFICULTY_ID: DifficultyId = 'normal';
export const MIN_RETIREMENT_AGE = 60;
