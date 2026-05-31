import { BUSINESS_MAP } from '../data/businesses';
import { HOUSING_MAP } from '../data/housing';
import type {
  CharacterStats,
  DifficultyId,
  GameState,
  MonthlyCycleResult,
  TimeState,
} from '../types/game';
import { getDifficulty } from './difficultyLogic';
import {
  getBusinessMonthlyIncome,
  getBusinessOperatingCost,
  getBusinessProblemChance,
} from './businessLogic';
import { applyFameMonthlyEffects } from './fameLogic';
import { processFamilyMonthly } from './familyLogic';
import { processRelationshipMonthly } from './relationshipLogic';
import { applyStatDelta, formatHistoryLine } from './gameLogic';
import type { RelationshipStatus } from '../types/game';

const BASE_FOOD = 28;
const BASE_BILLS = 16;
const LOW_HEALTH_THRESHOLD = 30;
const LOW_HAPPINESS_THRESHOLD = 30;
const HEALTH_EXPENSE = 38;
const LEISURE_EXPENSE = 20;

const BUSINESS_PROBLEMS = [
  {
    id: 'employee',
    message: (name: string) =>
      `sua ${name} teve um funcionário faltando e a operação atrasou.`,
    effects: { money: -22, stress: 7 },
  },
  {
    id: 'client',
    message: (name: string) =>
      `um cliente importante cancelou contrato na ${name}.`,
    effects: { money: -38, reputation: -5, stress: 6 },
  },
  {
    id: 'tax',
    message: (name: string) =>
      `você atrasou impostos da ${name} e pagou multa.`,
    effects: { money: -50, stress: 11 },
  },
  {
    id: 'operational',
    message: (name: string) =>
      `houve um problema operacional na ${name}.`,
    effects: { money: -28, stress: 9, happiness: -3 },
  },
] as const;

function getHousingCosts(housingId: string, difficultyId: DifficultyId): number {
  const housing = HOUSING_MAP[housingId];
  if (!housing) return 0;
  const diff = getDifficulty(difficultyId);
  let base =
    housing.type === 'rent'
      ? housing.monthlyRent + housing.livingCostExtra
      : housing.monthlyMaintenance + housing.livingCostExtra;
  return Math.round(base * diff.billsMultiplier);
}

export function calculateMonthlyExpenses(
  stats: CharacterStats,
  housingId: string,
  difficultyId: DifficultyId,
): number {
  const diff = getDifficulty(difficultyId);
  let total =
    Math.round((BASE_FOOD + BASE_BILLS) * diff.expenseMultiplier) +
    getHousingCosts(housingId, difficultyId);

  if (stats.physicalHealth < LOW_HEALTH_THRESHOLD) {
    total += HEALTH_EXPENSE;
  }
  if (stats.happiness < LOW_HAPPINESS_THRESHOLD) {
    total += LEISURE_EXPENSE;
  }

  return total;
}

function processBusinesses(
  stats: CharacterStats,
  ownedBusinessIds: string[],
  businessLevels: Record<string, number>,
  time: TimeState,
  housingId: string,
): { stats: CharacterStats; messages: string[]; income: number } {
  const messages: string[] = [];
  let currentStats = { ...stats };
  let totalIncome = 0;
  let totalOperating = 0;
  const housing = HOUSING_MAP[housingId];
  const badEventReduction = housing?.badEventChanceReduction ?? 0;

  ownedBusinessIds.forEach((bizId) => {
    const income = getBusinessMonthlyIncome(bizId, businessLevels);
    const operating = getBusinessOperatingCost(bizId, businessLevels);
    const problemChance = Math.max(
      0.04,
      getBusinessProblemChance(bizId, businessLevels) - badEventReduction,
    );

    totalIncome += income;
    totalOperating += operating;
    currentStats = applyStatDelta(currentStats, { money: income - operating });

    if (Math.random() < problemChance) {
      const problem =
        BUSINESS_PROBLEMS[
          Math.floor(Math.random() * BUSINESS_PROBLEMS.length)
        ];
      const name = BUSINESS_MAP[bizId]?.name ?? 'negócio';
      currentStats = applyStatDelta(currentStats, problem.effects);
      messages.push(formatHistoryLine(time, problem.message(name)));
    }
  });

  if (totalIncome > 0) {
    const net = totalIncome - totalOperating;
    messages.unshift(
      formatHistoryLine(
        time,
        `negócios: +R$ ${net}${totalOperating > 0 ? ` (op. R$ ${totalOperating})` : ''}.`,
      ),
    );
  }

  return { stats: currentStats, messages, income: totalIncome - totalOperating };
}

function applyHousingMonthlyBonuses(
  stats: CharacterStats,
  housingId: string,
): CharacterStats {
  const housing = HOUSING_MAP[housingId];
  if (!housing) return stats;
  return applyStatDelta(stats, {
    happiness: Math.min(3, Math.floor(housing.comfort / 35)),
    reputation: housing.monthlyReputationBonus,
  });
}

export function processMonthlyCycle(
  state: Pick<
    GameState,
    | 'stats'
    | 'currentHousingId'
    | 'ownedBusinessIds'
    | 'businessLevels'
    | 'difficultyId'
    | 'relationshipStatus'
    | 'relationshipScore'
    | 'fame'
    | 'hasChildren'
    | 'childrenCount'
  >,
  time: TimeState,
): MonthlyCycleResult & {
  relationshipStatus: RelationshipStatus;
  relationshipScore: number;
  fame: number;
} {
  let relationshipStatus = state.relationshipStatus;
  let relationshipScore = state.relationshipScore;
  let fame = state.fame;

  let expenses = calculateMonthlyExpenses(
    state.stats,
    state.currentHousingId,
    state.difficultyId,
  );
  const housing = HOUSING_MAP[state.currentHousingId];
  const messages: string[] = [];

  const businessResult = processBusinesses(
    state.stats,
    state.ownedBusinessIds,
    state.businessLevels,
    time,
    state.currentHousingId,
  );
  let currentStats = businessResult.stats;
  messages.push(...businessResult.messages);

  currentStats = applyHousingMonthlyBonuses(
    currentStats,
    state.currentHousingId,
  );

  const relMonthly = processRelationshipMonthly(
    currentStats,
    relationshipStatus,
    relationshipScore,
    time,
  );
  currentStats = relMonthly.stats;
  relationshipStatus = relMonthly.status;
  relationshipScore = relMonthly.score;
  messages.push(...relMonthly.messages);
  expenses += relMonthly.extraExpense;

  const familyMonthly = processFamilyMonthly(currentStats, state);
  currentStats = familyMonthly.stats;
  expenses += familyMonthly.extraExpense;

  currentStats = applyFameMonthlyEffects(currentStats, fame);
  fame = Math.min(100, fame);

  const moneyBefore = currentStats.money;
  currentStats = applyStatDelta(currentStats, { money: -expenses });

  const paidInFull = moneyBefore >= expenses;

  if (paidInFull) {
    const housingNote = housing?.type === 'rent' ? ' (incluindo aluguel)' : '';
    messages.push(
      formatHistoryLine(
        time,
        `contas pagas (R$ ${expenses})${housingNote}.`,
      ),
    );
  } else {
    const deficit = expenses - moneyBefore;
    const diff = getDifficulty(state.difficultyId);
    currentStats = applyStatDelta(currentStats, {
      stress: Math.round(12 * diff.stressGainMultiplier),
      happiness: -8,
      reputation: -2,
    });
    messages.push(
      formatHistoryLine(
        time,
        `contas em atraso (faltaram R$ ${deficit}).`,
      ),
    );
  }

  return {
    stats: currentStats,
    messages,
    totalExpenses: expenses,
    totalIncome: businessResult.income,
    paidInFull,
    relationshipStatus,
    relationshipScore,
    fame,
  };
}

export function getMonthlyExpensePreview(
  stats: CharacterStats,
  housingId: string,
  difficultyId: DifficultyId = 'normal',
): number {
  return calculateMonthlyExpenses(stats, housingId, difficultyId);
}

export function getMonthlyBusinessIncome(
  ownedBusinessIds: string[],
  businessLevels: Record<string, number> = {},
): number {
  return ownedBusinessIds.reduce((sum, id) => {
    const income = getBusinessMonthlyIncome(id, businessLevels);
    const op = getBusinessOperatingCost(id, businessLevels);
    return sum + income - op;
  }, 0);
}
