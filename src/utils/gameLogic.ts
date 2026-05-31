import { ACTION_MAP } from '../data/actions';
import { ORIGIN_MAP } from '../data/origins';
import { TRAIT_MAP } from '../data/traits';
import { getBusinessAssetValue as calcBusinessAssetValue } from './businessLogic';
import {
  applyDifficultyToActionDelta,
  getBurnoutThreshold,
  scaleMoneyReward,
} from './difficultyLogic';
import { classifyLife } from './lifeClassification';
import { getDominantLifePath } from './lifePathLogic';
import { getPatrimonyContext } from './storage';
import { getCareer } from './careerLogic';
import { getHousing } from './housingLogic';
import { HOUSING_MAP } from '../data/housing';
import {
  applyTraitToActionEffects,
  applyTraitToConsequenceDelta,
  getInvestTraitBonus,
} from './traitLogic';
import { LIFE_PHASES } from '../data/lifePhases';
import { UPGRADES } from '../data/upgrades';
import type {
  ActionComputeResult,
  ActionId,
  CharacterStats,
  DifficultyId,
  GameAction,
  GameOverState,
  GameOverType,
  GameState,
  LifePathId,
  LifePhase,
  OriginId,
  PatrimonyContext,
  StatDelta,
  TimeState,
  TraitId,
} from '../types/game';
import {
  DEBT_THRESHOLD,
  INITIAL_AGE,
  INITIAL_MONTH,
  LOW_ENERGY_THRESHOLD,
  LOW_MENTAL_THRESHOLD,
  STAT_LIMITS,
} from '../types/game';

const BONUS_MULTIPLIER = 1.5;

export function createInitialStats(): CharacterStats {
  return {
    money: 110,
    energy: 80,
    physicalHealth: 80,
    mentalHealth: 75,
    happiness: 70,
    reputation: 50,
    stress: 20,
    intelligence: 40,
    charisma: 45,
  };
}

export function createInitialTime(): TimeState {
  return { age: INITIAL_AGE, month: INITIAL_MONTH };
}

function clampStat(value: number, isMoney = false): number {
  if (isMoney) return value;
  return Math.max(STAT_LIMITS.min, Math.min(STAT_LIMITS.max, value));
}

export function applyStatDelta(
  stats: CharacterStats,
  delta: StatDelta,
): CharacterStats {
  const next = { ...stats };

  (Object.keys(delta) as (keyof StatDelta)[]).forEach((key) => {
    const change = delta[key];
    if (change === undefined) return;
    if (key === 'fame' || key === 'relationshipScore') return;
    if (key === 'money') {
      next.money += change;
    } else {
      next[key] = clampStat(next[key] + change);
    }
  });

  return next;
}

function hasUpgrade(purchased: string[], id: string): boolean {
  return purchased.includes(id);
}

export function getUpgradeAssetValue(purchasedUpgrades: string[]): number {
  return UPGRADES.filter((u) => purchasedUpgrades.includes(u.id)).reduce(
    (sum, u) => sum + u.cost,
    0,
  );
}

export function getHousingAssetValue(ownedHousingIds: string[]): number {
  return ownedHousingIds.reduce((sum, id) => {
    const h = HOUSING_MAP[id];
    return sum + (h?.assetValue ?? 0);
  }, 0);
}

export function getBusinessAssetValue(
  ownedBusinessIds: string[],
  businessLevels: Record<string, number> = {},
): number {
  return ownedBusinessIds.reduce(
    (sum, id) => sum + calcBusinessAssetValue(id, businessLevels),
    0,
  );
}

export function calculatePatrimony(
  stats: CharacterStats,
  assets: PatrimonyContext,
): number {
  return (
    stats.money +
    getUpgradeAssetValue(assets.purchasedUpgrades) +
    getHousingAssetValue(assets.ownedHousingIds) +
    getBusinessAssetValue(
      assets.ownedBusinessIds,
      assets.businessLevels ?? {},
    )
  );
}

const CAREER_STAT_BASE: Record<string, number> = {
  charisma: 45,
  intelligence: 50,
  reputation: 50,
};

export function calculateWorkIncome(
  careerId: string,
  purchasedUpgrades: string[],
  stats?: CharacterStats,
  difficultyId: DifficultyId = 'normal',
): number {
  const career = getCareer(careerId);
  let income = career.baseSalary;

  if (stats && career.workBonusStat && career.workBonusPerPoint) {
    const key =
      career.workBonusStat === 'charisma'
        ? 'charisma'
        : career.workBonusStat === 'intelligence'
          ? 'intelligence'
          : 'reputation';
    const base = CAREER_STAT_BASE[career.workBonusStat] ?? 50;
    income += Math.max(
      0,
      Math.floor((stats[key] - base) * career.workBonusPerPoint),
    );
  }

  if (hasUpgrade(purchasedUpgrades, 'notebook')) {
    income = Math.round(income * BONUS_MULTIPLIER);
  }
  return scaleMoneyReward(income, difficultyId);
}

export function getLifePhase(age: number): LifePhase {
  return (
    LIFE_PHASES.find((p) => age >= p.minAge && age <= p.maxAge) ??
    LIFE_PHASES[LIFE_PHASES.length - 1]
  );
}

export function calculateMonthsLived(time: TimeState): number {
  return (time.age - INITIAL_AGE) * 12 + (time.month - INITIAL_MONTH);
}

export function getInvestOutcome(
  stats: CharacterStats,
  traitId: TraitId,
): StatDelta {
  const intelligenceBonus = Math.min(0.25, (stats.intelligence - 50) / 200);
  const traitBonus = getInvestTraitBonus(traitId);
  const roll = Math.random();
  const lossThreshold = 0.28 - intelligenceBonus - traitBonus;
  const impulsive = traitId === 'impulsive';

  if (roll < lossThreshold) {
    return { money: impulsive ? -100 : -70, stress: 6 };
  }
  if (roll < 0.58) {
    return { money: 45 };
  }
  const gain = Math.round(90 + stats.intelligence * 0.55);
  return { money: gain, happiness: 5, reputation: 3 };
}

export function computeActionEffects(
  actionId: ActionId,
  purchasedUpgrades: string[],
  statsBefore: CharacterStats,
  careerId: string,
  housingId: string,
  traitId: TraitId,
  difficultyId: DifficultyId = 'normal',
): ActionComputeResult {
  const action = ACTION_MAP[actionId];
  const effects: StatDelta = { ...action.effects };
  const flags: ActionComputeResult['flags'] = {};
  const housing = getHousing(housingId);

  if (actionId === 'work') {
    const career = getCareer(careerId);
    effects.money = calculateWorkIncome(
      careerId,
      purchasedUpgrades,
      statsBefore,
      difficultyId,
    );
    if (career.extraStressOnWork) {
      effects.stress = (effects.stress ?? 0) + career.extraStressOnWork;
    }
    if (statsBefore.energy < LOW_ENERGY_THRESHOLD) {
      effects.physicalHealth = (effects.physicalHealth ?? 0) - 8;
      effects.mentalHealth = (effects.mentalHealth ?? 0) - 4;
      effects.stress = (effects.stress ?? 0) + 5;
      flags.lowEnergyWork = true;
    }
  }

  if (actionId === 'study') {
    const career = getCareer(careerId);
    if (career.studyMultiplier && effects.intelligence) {
      effects.intelligence = Math.round(
        effects.intelligence * career.studyMultiplier,
      );
    }
    if (hasUpgrade(purchasedUpgrades, 'online_course') && effects.intelligence) {
      effects.intelligence = Math.round(effects.intelligence * BONUS_MULTIPLIER);
    }
    const studyHousingBonus = Math.floor(housing.comfort / 25);
    if (studyHousingBonus > 0 && effects.intelligence) {
      effects.intelligence += studyHousingBonus;
    }
    if (statsBefore.mentalHealth < LOW_MENTAL_THRESHOLD) {
      if (effects.intelligence) {
        effects.intelligence = Math.max(2, Math.round(effects.intelligence * 0.5));
      }
      flags.lowMentalStudy = true;
    }
  }

  if (actionId === 'rest') {
    if (effects.energy) {
      let energyGain = Math.round(effects.energy * housing.restEnergyMultiplier);
      if (hasUpgrade(purchasedUpgrades, 'comfortable_bed')) {
        energyGain = Math.round(energyGain * BONUS_MULTIPLIER);
      }
      effects.energy = energyGain;
    }
    if (housing.happinessBonus) {
      effects.happiness = (effects.happiness ?? 0) + housing.happinessBonus;
    }
    const comfortBonus = Math.floor(housing.comfort / 20);
    if (comfortBonus > 0) {
      effects.mentalHealth = (effects.mentalHealth ?? 0) + Math.min(4, comfortBonus);
    }
  }

  if (actionId === 'socialize' && hasUpgrade(purchasedUpgrades, 'better_clothes')) {
    if (effects.charisma) {
      effects.charisma = Math.round(effects.charisma * BONUS_MULTIPLIER);
    }
  }

  if (actionId === 'train') {
    if (hasUpgrade(purchasedUpgrades, 'gym_plan') && effects.physicalHealth) {
      effects.physicalHealth = Math.round(effects.physicalHealth * BONUS_MULTIPLIER);
    }
    if (statsBefore.energy < LOW_ENERGY_THRESHOLD) {
      const injuryRoll = Math.random();
      if (injuryRoll < 0.65) {
        effects.physicalHealth = (effects.physicalHealth ?? 0) - 12;
        effects.happiness = (effects.happiness ?? 0) - 5;
        flags.trainingInjury = true;
      }
    }
  }

  if (actionId === 'invest') {
    const investResult = getInvestOutcome(statsBefore, traitId);
    Object.assign(effects, investResult);
    if (investResult.money && investResult.money > 0) flags.investGain = true;
    else if (investResult.money && investResult.money < 0) flags.investLoss = true;
    else flags.investNeutral = true;
  }

  const traitApplied = applyTraitToActionEffects(actionId, effects, traitId);
  const withDifficulty = applyDifficultyToActionDelta(
    traitApplied,
    difficultyId,
  );
  return { effects: withDifficulty, flags };
}

export function shouldIncrementExhaustion(
  actionId: ActionId,
  energyBefore: number,
): boolean {
  return (
    (actionId === 'work' || actionId === 'study') &&
    energyBefore < LOW_ENERGY_THRESHOLD
  );
}

export function advanceTime(time: TimeState): TimeState {
  let { age, month } = time;
  month += 1;
  if (month > 12) {
    month = 1;
    age += 1;
  }
  return { age, month };
}

export function formatTime(time: TimeState): string {
  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  return `${months[time.month - 1]} · ${time.age} anos`;
}

export function formatNarrative(
  time: TimeState,
  body: string,
): string {
  const monthNames = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ];
  const monthName = monthNames[time.month - 1];
  return `Aos ${time.age} anos, em ${monthName}, ${body}`;
}

/** Histórico mensal — frases curtas (diário e game over ficam longos). */
export function formatHistoryLine(time: TimeState, body: string): string {
  return `${time.age}a · mês ${time.month} — ${body}`;
}

export function buildActionHistoryMessage(
  action: GameAction,
  effects: StatDelta,
  time: TimeState,
  flags: ActionComputeResult['flags'],
): string {
  switch (action.id) {
    case 'work': {
      const money = effects.money ?? 0;
      const extra = flags.lowEnergyWork
        ? ' Seu corpo protestou — você estava no limite da exaustão.'
        : '';
      return formatHistoryLine(
        time,
        `trabalhou (+R$ ${money}, mais cansaço).${extra ? ' Corpo no limite.' : ''}`,
      );
    }
    case 'study': {
      const reduced = flags.lowMentalStudy
        ? ' A mente pesada fez o estudo render menos do que você esperava.'
        : ' Você saiu mais inteligente, porém mais exausto.';
      return formatHistoryLine(time, `estudou.${reduced ? ' Mente pesada.' : ''}`);
    }
    case 'rest':
      return formatHistoryLine(time, 'descansou e recuperou energia.');
    case 'socialize':
      return formatHistoryLine(time, 'socializou (humor ↑, bolso ↓).');
    case 'train': {
      const injury = flags.trainingInjury
        ? ' O treino pesado demais resultou em uma lesão dolorosa.'
        : ' Você se sentiu mais forte ao fim do mês.';
      return formatHistoryLine(time, `treinou.${injury ? ' Lesão.' : ''}`);
    }
    case 'invest': {
      if (flags.investGain && effects.money) {
        return formatHistoryLine(
          time,
          `investiu com lucro (+R$ ${effects.money}).`,
        );
      }
      if (flags.investLoss && effects.money) {
        return formatHistoryLine(
          time,
          `investiu e perdeu R$ ${Math.abs(effects.money)}.`,
        );
      }
      return formatHistoryLine(time, 'investiu — retorno modesto.');
    }
    default:
      return formatHistoryLine(time, 'algo mudou na rotina.');
  }
}

export function buildUpgradeHistoryMessage(
  upgradeName: string,
  time: TimeState,
): string {
  return formatHistoryLine(time, `comprou ${upgradeName}.`);
}

export function buildEventHistoryMessage(
  message: string,
  time: TimeState,
): string {
  const lower = message.charAt(0).toLowerCase() + message.slice(1);
  return formatHistoryLine(time, lower);
}

export function buildCareerChangeMessage(
  careerName: string,
  time: TimeState,
  perkDescription?: string,
): string {
  const extra = perkDescription ? ` ${perkDescription}` : '';
  return formatHistoryLine(
    time,
    `promovido a ${careerName}.${extra ? ` ${extra}` : ''}`,
  );
}

export function buildBusinessUpgradeMessage(
  businessName: string,
  level: number,
  time: TimeState,
): string {
  return formatHistoryLine(
    time,
    `${businessName} subiu para nível ${level}.`,
  );
}

export function buildHousingRentMessage(
  housingName: string,
  time: TimeState,
): string {
  return formatHistoryLine(time, `alugou ${housingName}.`);
}

export function buildHousingPurchaseMessage(
  housingName: string,
  time: TimeState,
): string {
  return formatHistoryLine(time, `comprou ${housingName}.`);
}

export function buildHousingMoveMessage(
  housingName: string,
  time: TimeState,
): string {
  return formatHistoryLine(time, `mudou para ${housingName}.`);
}

export function buildBusinessPurchaseMessage(
  businessName: string,
  time: TimeState,
): string {
  return formatHistoryLine(time, `comprou o negócio ${businessName}.`);
}

export function applyDebtPenalties(
  stats: CharacterStats,
  time: TimeState,
): { stats: CharacterStats; message: string | null } {
  if (stats.money >= DEBT_THRESHOLD) {
    return { stats, message: null };
  }
  const penalized = applyStatDelta(stats, {
    happiness: -6,
    reputation: -3,
    stress: 6,
    mentalHealth: -4,
  });
  return {
    stats: penalized,
    message: formatHistoryLine(
      time,
      'dívidas apertaram — humor e reputação caíram.',
    ),
  };
}

export interface ConsequenceResult {
  stats: CharacterStats;
  time: TimeState;
  historyMessages: string[];
  gameOver: GameOverState | null;
  exhaustionCounter: number;
}

export interface GameOverProfile {
  characterName: string;
  originId: OriginId;
  traitId: TraitId;
  difficultyId: DifficultyId;
  dominantLifePathId: LifePathId;
  currentCareerId: string;
  ownedBusinessIds: string[];
  unlockedAchievementIds: string[];
  fame: number;
  relationshipStatus: GameState['relationshipStatus'];
}

function buildGameOver(
  type: GameOverType,
  stats: CharacterStats,
  time: TimeState,
  assets: PatrimonyContext,
  totalActions: number,
  cause: string,
  profile: GameOverProfile,
): GameOverState {
  const patrimony = calculatePatrimony(stats, assets);
  const monthsLived = calculateMonthsLived(time);
  const lifeSummary = buildLifeSummary(
    type,
    time.age,
    stats,
    patrimony,
    monthsLived,
    totalActions,
    profile,
  );

  const classification = classifyLife({
    type,
    stats,
    patrimony,
    age: time.age,
    careerId: profile.currentCareerId,
    businessCount: profile.ownedBusinessIds.length,
    achievementCount: profile.unlockedAchievementIds.length,
    difficultyId: profile.difficultyId,
    monthsLived,
    dominantLifePathId: profile.dominantLifePathId,
    fame: profile.fame,
  });

  const title =
    type === 'retirement'
      ? 'Jornada concluída'
      : type === 'death'
        ? 'Fim da jornada'
        : 'Colapso mental';

  return {
    type,
    title,
    message: lifeSummary,
    cause,
    lifeSummary,
    lifeClassification: classification.id,
    lifeClassificationLabel: classification.label,
    finalAge: time.age,
    finalMoney: stats.money,
    finalPatrimony: patrimony,
    monthsLived,
    characterName: profile.characterName,
    originId: profile.originId,
    traitId: profile.traitId,
    difficultyId: profile.difficultyId,
    dominantLifePathId: profile.dominantLifePathId,
    finalCareerId: profile.currentCareerId,
    ownedBusinessIds: profile.ownedBusinessIds,
    unlockedAchievementIds: profile.unlockedAchievementIds,
    biography: lifeSummary,
    diaryHighlights: [],
    positiveMemories: [],
    negativeMemories: [],
    relationshipStatus: profile.relationshipStatus,
    relationshipScore: 0,
    hasChildren: false,
    childrenCount: 0,
    emotionalLegacy: '',
    financialLegacy: '',
  };
}

export function buildRetirementGameOver(
  state: Pick<
    GameState,
    | 'stats'
    | 'time'
    | 'characterName'
    | 'originId'
    | 'traitId'
    | 'difficultyId'
    | 'currentCareerId'
    | 'ownedBusinessIds'
    | 'unlockedAchievementIds'
    | 'purchasedUpgrades'
    | 'ownedHousingIds'
    | 'businessLevels'
    | 'lifePathTracking'
    | 'fame'
    | 'relationshipStatus'
  >,
  totalActions: number,
): GameOverState {
  const assets = getPatrimonyContext(state);
  const profile: GameOverProfile = {
    characterName: state.characterName,
    originId: state.originId,
    traitId: state.traitId,
    difficultyId: state.difficultyId,
    dominantLifePathId: getDominantLifePath(state.lifePathTracking),
    currentCareerId: state.currentCareerId,
    ownedBusinessIds: state.ownedBusinessIds,
    unlockedAchievementIds: state.unlockedAchievementIds,
    fame: state.fame,
    relationshipStatus: state.relationshipStatus,
  };
  return buildGameOver(
    'retirement',
    state.stats,
    state.time,
    assets,
    totalActions,
    `Aposentadoria aos ${state.time.age} anos — você escolheu encerrar a jornada com honra.`,
    profile,
  );
}

function buildLifeSummary(
  type: GameOverType,
  age: number,
  stats: CharacterStats,
  patrimony: number,
  monthsLived: number,
  totalActions: number,
  profile: GameOverProfile,
): string {
  const name = profile.characterName;
  const origin = ORIGIN_MAP[profile.originId].name.toLowerCase();
  const trait = TRAIT_MAP[profile.traitId].name.toLowerCase();
  const career = getCareer(profile.currentCareerId).name.toLowerCase();

  if (type === 'retirement') {
    return `${name} encerrou aos ${age} anos como ${career}, com patrimônio de R$ ${patrimony.toLocaleString('pt-BR')} e ${profile.ownedBusinessIds.length} negócio(s) no currículo. Uma vida vivida com intenção.`;
  }

  if (type === 'mental_collapse') {
    if (profile.traitId === 'ambitious') {
      return `${name} começou ${origin}, lutou para crescer como ${career}, mas sacrificou a saúde mental pelo excesso de trabalho.`;
    }
    return `${name}, de origem ${origin} e traço ${trait}, chegou aos ${age} anos antes da mente desabar. Patrimônio: R$ ${patrimony.toLocaleString('pt-BR')}.`;
  }

  if (profile.originId === 'privileged' && profile.traitId === 'impulsive') {
    return `${name} nasceu privilegiada, multiplicou patrimônio até R$ ${patrimony.toLocaleString('pt-BR')}, mas perdeu tudo em decisões impulsivas.`;
  }

  if (profile.originId === 'humble' && patrimony >= 3000) {
    return `${name} começou com pouco, construiu um império modesto e morreu aos ${age} anos deixando R$ ${patrimony.toLocaleString('pt-BR')} de legado.`;
  }

  if (stats.stress >= 70 && totalActions > 15) {
    return `${name} morreu aos ${age} anos após ignorar a saúde por tempo demais. Trabalhou até o limite.`;
  }

  return `${name} encerrou a jornada aos ${age} anos como ${career}, com patrimônio de R$ ${patrimony.toLocaleString('pt-BR')} após ${monthsLived} meses de vida.`;
}

function applyFaint(
  stats: CharacterStats,
  time: TimeState,
): { stats: CharacterStats; time: TimeState; message: string } {
  const newStats = applyStatDelta(stats, {
    physicalHealth: -12,
    mentalHealth: -8,
    stress: -10,
    energy: 30,
  });
  const newTime = advanceTime(time);
  return {
    stats: newStats,
    time: newTime,
    message: formatHistoryLine(
      time,
      'desmaiou de exaustão. Perdeu semanas.',
    ),
  };
}

function applyStressCrisis(
  stats: CharacterStats,
  time: TimeState,
  traitId: TraitId,
): { stats: CharacterStats; message: string } {
  const delta = applyTraitToConsequenceDelta(
    { mentalHealth: -25, happiness: -20, energy: -15 },
    traitId,
  );
  const newStats = applyStatDelta(stats, delta);
  newStats.stress = 75;
  return {
    stats: newStats,
    message: formatHistoryLine(time, 'crise de estresse extremo.'),
  };
}

function applyBurnout(
  stats: CharacterStats,
  time: TimeState,
  traitId: TraitId,
): { stats: CharacterStats; message: string } {
  const delta = applyTraitToConsequenceDelta(
    {
      mentalHealth: -30,
      physicalHealth: -15,
      money: -80,
      happiness: -10,
      energy: -10,
      stress: 15,
    },
    traitId,
  );
  const newStats = applyStatDelta(stats, delta);
  return {
    stats: newStats,
    message: formatHistoryLine(
      time,
      'burnout — afastamento e R$ 80 de custo.',
    ),
  };
}

export function checkConsequences(
  stats: CharacterStats,
  time: TimeState,
  exhaustionCounter: number,
  assets: PatrimonyContext,
  totalActions: number,
  profile: GameOverProfile,
  traitId: TraitId,
  difficultyId: DifficultyId = 'normal',
): ConsequenceResult {
  const burnoutThreshold = getBurnoutThreshold(difficultyId);
  const historyMessages: string[] = [];
  let currentStats = { ...stats };
  let currentTime = { ...time };
  let currentExhaustion = exhaustionCounter;

  if (currentStats.physicalHealth <= 0) {
    return {
      stats: currentStats,
      time: currentTime,
      historyMessages,
      gameOver: buildGameOver(
        'death',
        currentStats,
        currentTime,
        assets,
        totalActions,
        'Saúde física zerada — seu corpo não resistiu.',
        profile,
      ),
      exhaustionCounter: 0,
    };
  }

  if (currentStats.mentalHealth <= 0) {
    historyMessages.push(
      formatNarrative(currentTime, 'você entrou em colapso mental.'),
    );
    return {
      stats: currentStats,
      time: currentTime,
      historyMessages,
      gameOver: buildGameOver(
        'mental_collapse',
        currentStats,
        currentTime,
        assets,
        totalActions,
        'Saúde mental zerada — colapso emocional irreversível.',
        profile,
      ),
      exhaustionCounter: 0,
    };
  }

  if (currentExhaustion >= burnoutThreshold) {
    const burnout = applyBurnout(currentStats, currentTime, traitId);
    currentStats = burnout.stats;
    historyMessages.push(burnout.message);
    currentExhaustion = 0;
  }

  if (currentStats.energy <= 0) {
    const faint = applyFaint(currentStats, currentTime);
    currentStats = faint.stats;
    currentTime = faint.time;
    historyMessages.push(faint.message);
  }

  if (currentStats.stress >= 100) {
    const crisis = applyStressCrisis(currentStats, currentTime, traitId);
    currentStats = crisis.stats;
    historyMessages.push(crisis.message);
  }

  if (currentStats.physicalHealth <= 0) {
    return {
      stats: currentStats,
      time: currentTime,
      historyMessages,
      gameOver: buildGameOver(
        'death',
        currentStats,
        currentTime,
        assets,
        totalActions,
        'O desmaio e o desgaste foram fatais.',
        profile,
      ),
      exhaustionCounter: currentExhaustion,
    };
  }

  if (currentStats.mentalHealth <= 0) {
    historyMessages.push(
      formatNarrative(currentTime, 'você entrou em colapso mental.'),
    );
    return {
      stats: currentStats,
      time: currentTime,
      historyMessages,
      gameOver: buildGameOver(
        'mental_collapse',
        currentStats,
        currentTime,
        assets,
        totalActions,
        'Após a crise, sua mente não suportou mais.',
        profile,
      ),
      exhaustionCounter: currentExhaustion,
    };
  }

  return {
    stats: currentStats,
    time: currentTime,
    historyMessages,
    gameOver: null,
    exhaustionCounter: currentExhaustion,
  };
}

export function shouldTriggerEvent(actionsSinceLastEvent: number): boolean {
  const threshold = 3 + Math.floor(Math.random() * 3);
  return actionsSinceLastEvent >= threshold;
}

export function canAffordAction(
  stats: CharacterStats,
  actionId: ActionId,
): boolean {
  if (actionId === 'rest') return true;

  const action = ACTION_MAP[actionId];
  const cost = action.effects.money;
  if (cost !== undefined && cost < 0 && stats.money + cost < -1000) {
    return false;
  }
  return stats.energy > 0;
}

/* ── Resumos para UI ── */

export function getFinancialSituation(
  stats: CharacterStats,
  assets: PatrimonyContext,
): string {
  const patrimony = calculatePatrimony(stats, assets);
  if (stats.money < DEBT_THRESHOLD) return 'Endividado e sob pressão';
  if (patrimony >= 2000) return 'Patrimônio sólido em crescimento';
  if (patrimony >= 800) return 'Finanças estáveis';
  if (stats.money >= 300) return 'Dinheiro suficiente para respirar';
  if (stats.money >= 50) return 'Contas apertadas, mas sob controle';
  return 'Sobrevivendo mês a mês';
}

export function getHealthSituation(stats: CharacterStats): string {
  const avg = (stats.physicalHealth + stats.mentalHealth + stats.energy) / 3;
  if (avg >= 70) return 'Saúde em bom estado';
  if (avg >= 45) return 'Saúde razoável, mas exige cuidado';
  if (stats.physicalHealth <= 25 || stats.mentalHealth <= 25) {
    return 'Saúde crítica — risco iminente';
  }
  return 'Corpo e mente desgastados';
}

export function getEmotionalSituation(stats: CharacterStats): string {
  if (stats.stress >= 85) return 'Emocionalmente no limite';
  if (stats.happiness >= 75 && stats.stress < 50) return 'Bem emocionalmente';
  if (stats.happiness >= 50) return 'Humor estável';
  if (stats.happiness >= 30) return 'Ansiedade e cansaço frequentes';
  return 'Emocionalmente abalado';
}

export function getGeneralStatusPhrase(
  stats: CharacterStats,
  time: TimeState,
  assets: PatrimonyContext,
  ownedBusinessIds: string[],
  characterName: string,
): string {
  const who = characterName || 'Você';
  if (stats.physicalHealth <= 15 || stats.mentalHealth <= 15) {
    return `${who} está à beira do colapso. Pare agora ou pague o preço máximo.`;
  }
  if (stats.stress >= 85 || stats.energy <= 15) {
    return `${who} está perto de um colapso. Corpo e mente pedem socorro.`;
  }
  if (time.age <= 21 && stats.money < 200) {
    return `${who} ainda está tentando encontrar seu lugar no mundo.`;
  }
  if (stats.stress >= 60 && stats.money > 300) {
    return `A ambição de ${who} está abrindo portas, mas cobrando um preço.`;
  }
  const balance =
    stats.happiness >= 55 &&
    stats.physicalHealth >= 50 &&
    stats.mentalHealth >= 50 &&
    stats.stress < 60;
  if (ownedBusinessIds.length >= 2) {
    return `O império de ${who} começa a sair do papel.`;
  }
  if (balance && calculatePatrimony(stats, assets) >= 500) {
    return `${who} está construindo uma vida estável.`;
  }
  if (calculatePatrimony(stats, assets) >= 2000) {
    return `${who} chegou longe — mas precisa cuidar de si mesmo.`;
  }
  if (getLifePhase(time.age).id === 'legacy') {
    return `${who} pensa no legado que deixará.`;
  }
  return `${who} segue escrevendo sua história, mês após mês.`;
}
