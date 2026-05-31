export type ActionId =
  | 'work'
  | 'study'
  | 'rest'
  | 'socialize'
  | 'train'
  | 'invest';

export type StatKey =
  | 'money'
  | 'energy'
  | 'physicalHealth'
  | 'mentalHealth'
  | 'happiness'
  | 'reputation'
  | 'stress'
  | 'intelligence'
  | 'charisma';

export interface CharacterStats {
  money: number;
  energy: number;
  physicalHealth: number;
  mentalHealth: number;
  happiness: number;
  reputation: number;
  stress: number;
  intelligence: number;
  charisma: number;
}

export interface TimeState {
  age: number;
  month: number;
}

export interface StatDelta {
  money?: number;
  energy?: number;
  physicalHealth?: number;
  mentalHealth?: number;
  happiness?: number;
  reputation?: number;
  stress?: number;
  intelligence?: number;
  charisma?: number;
  /** Aplicado fora de CharacterStats (fama pública) */
  fame?: number;
  /** Aplicado fora de CharacterStats (relacionamento romântico) */
  relationshipScore?: number;
}

export interface GameAction {
  id: ActionId;
  name: string;
  description: string;
  icon: string;
  effects: StatDelta;
}

export type RelationshipStatus = 'single' | 'dating' | 'married' | 'separated';

export type LifePathId =
  | 'corporate'
  | 'entrepreneur'
  | 'tech'
  | 'digital_influence'
  | 'investments'
  | 'balanced';

export interface LifePathTracking {
  corporate: number;
  entrepreneur: number;
  tech: number;
  digital_influence: number;
  investments: number;
  balanced: number;
}

export type LifeDiaryEntryType =
  | 'career'
  | 'love'
  | 'money'
  | 'health'
  | 'business'
  | 'housing'
  | 'achievement'
  | 'tragedy'
  | 'legacy'
  | 'family';

export interface LifeDiaryEntry {
  id: string;
  age: number;
  month: number;
  title: string;
  description: string;
  type: LifeDiaryEntryType;
  partnerName?: string;
}

export type MemoryId =
  | 'first_big_salary'
  | 'unforgettable_trip'
  | 'happy_marriage'
  | 'life_changing_business'
  | 'comeback'
  | 'traumatic_burnout'
  | 'suffocating_debt'
  | 'painful_breakup'
  | 'public_failure'
  | 'missed_opportunity';

export type ConsequenceTag =
  | 'promised_partner_change'
  | 'dubious_proposal_accepted'
  | 'ignored_health_warning'
  | 'fought_with_partner'
  | 'risky_debt'
  | 'helped_important_friend';

export interface EventChoice {
  id: string;
  label: string;
  effects: StatDelta;
  historyMessage: string;
  relationshipScore?: number;
  fame?: number;
  relationshipStatus?: RelationshipStatus;
  consequenceTag?: ConsequenceTag;
  clearsConsequence?: ConsequenceTag;
  memoryId?: MemoryId;
  diaryMilestoneId?: string;
  hasChildren?: boolean;
  childrenDelta?: number;
}

export type EventRiskLevel = 'low' | 'medium' | 'high' | 'extreme';

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  riskLevel?: EventRiskLevel;
  isRare?: boolean;
  lifePath?: LifePathId;
  requiresRelationship?: RelationshipStatus[];
  requiresConsequence?: ConsequenceTag;
  requiresChildren?: boolean;
  requiresNoChildren?: boolean;
  minRelationshipMonths?: number;
  choices: EventChoice[];
}

export type DifficultyId = 'normal' | 'hard' | 'survival';

export type LifeClassificationId =
  | 'survivor'
  | 'common_worker'
  | 'broken_promise'
  | 'rich_unbalanced'
  | 'respected_entrepreneur'
  | 'magnate'
  | 'empire_legend'
  | 'ambition_tragedy'
  | 'simple_happy_life'
  | 'retired_peaceful'
  | 'corporate_legend'
  | 'visionary_founder'
  | 'investment_magnate'
  | 'unstable_celebrity'
  | 'tech_genius'
  | 'balanced_life_fulfilled';

export type OriginId = 'humble' | 'middle_class' | 'privileged';
export type TraitId =
  | 'ambitious'
  | 'disciplined'
  | 'charismatic'
  | 'intelligent'
  | 'lucky'
  | 'impulsive'
  | 'resilient';

export interface ObjectiveReward {
  money?: number;
  reputation?: number;
  happiness?: number;
  stress?: number;
  intelligence?: number;
  mentalHealth?: number;
}

export type ObjectiveConditionType =
  | 'money_gte'
  | 'career_not'
  | 'career_is'
  | 'upgrade_count_gte'
  | 'housing_not'
  | 'owns_housing'
  | 'business_count_gte'
  | 'patrimony_gte'
  | 'age_gte'
  | 'mental_health_gte';

export interface Objective {
  id: string;
  title: string;
  description: string;
  conditionType: ObjectiveConditionType;
  conditionValue: number | string;
  reward: ObjectiveReward;
}

export type AchievementConditionType =
  | 'worked_once'
  | 'had_burnout'
  | 'near_death'
  | 'rich_young'
  | 'business_count_gte'
  | 'intelligence_gte'
  | 'balanced_stats'
  | 'work_count_gte'
  | 'invest_wins_gte'
  | 'had_heavy_debt'
  | 'comeback';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  conditionType: AchievementConditionType;
  conditionValue?: number;
  reward: ObjectiveReward;
}

export type NotificationType =
  | 'objective'
  | 'achievement'
  | 'promotion'
  | 'business'
  | 'crisis'
  | 'warning';

export interface GameNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
}

export interface GameTracking {
  workCount: number;
  investWins: number;
  hadBurnout: boolean;
  hadNearDeath: boolean;
  hadHeavyDebt: boolean;
  wasInHeavyDebt: boolean;
  workedOnce: boolean;
}

export type EventCategory =
  | 'work'
  | 'health'
  | 'relationship'
  | 'money'
  | 'morality'
  | 'studies'
  | 'family'
  | 'business'
  | 'unexpected';

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  effectKey: UpgradeEffectKey;
}

export type UpgradeEffectKey =
  | 'workBonus'
  | 'studyBonus'
  | 'restBonus'
  | 'socialBonus'
  | 'trainBonus';

export type HousingType = 'owned' | 'rent';

export interface Housing {
  id: string;
  name: string;
  description: string;
  type: HousingType;
  purchaseCost: number;
  monthlyRent: number;
  monthlyMaintenance: number;
  livingCostExtra: number;
  restEnergyMultiplier: number;
  happinessBonus: number;
  assetValue: number;
  comfort: number;
  security: number;
  socialStatus: number;
  monthlyReputationBonus: number;
  badEventChanceReduction: number;
}

export type CareerBonusStat = 'charisma' | 'intelligence' | 'reputation';

export interface Career {
  id: string;
  name: string;
  description: string;
  baseSalary: number;
  minIntelligence: number;
  minCharisma: number;
  minReputation: number;
  entryCost: number;
  nextCareerIds: string[];
  perkDescription?: string;
  workBonusStat?: CareerBonusStat;
  workBonusPerPoint?: number;
  extraStressOnWork?: number;
  studyMultiplier?: number;
  businessEventChanceBonus?: number;
}

export interface Business {
  id: string;
  name: string;
  description: string;
  cost: number;
  monthlyIncome: number;
  assetValue: number;
  minIntelligence: number;
  minCharisma: number;
  minReputation: number;
  problemChance: number;
  maxLevel: number;
  upgradeCosts: number[];
  incomeByLevel: number[];
  problemChanceByLevel: number[];
  operatingCostByLevel: number[];
}

export type HistoryEntryType =
  | 'action'
  | 'event'
  | 'achievement'
  | 'objective'
  | 'crisis'
  | 'business'
  | 'housing'
  | 'career'
  | 'monthly'
  | 'general';

export interface HistoryEntry {
  id: string;
  message: string;
  timestamp: number;
}

export interface AchievementUnlockMeta {
  age: number;
  month: number;
}

export type GameOverType = 'death' | 'mental_collapse' | 'retirement';

export interface GameOverState {
  type: GameOverType;
  title: string;
  message: string;
  cause: string;
  lifeSummary: string;
  biography: string;
  lifeClassification: LifeClassificationId;
  lifeClassificationLabel: string;
  finalAge: number;
  finalMoney: number;
  finalPatrimony: number;
  monthsLived: number;
  characterName: string;
  originId: OriginId;
  traitId: TraitId;
  difficultyId: DifficultyId;
  finalCareerId: string;
  dominantLifePathId: LifePathId;
  ownedBusinessIds: string[];
  unlockedAchievementIds: string[];
  diaryHighlights: LifeDiaryEntry[];
  positiveMemories: string[];
  negativeMemories: string[];
  partnerName?: string;
  exPartnerName?: string;
  relationshipStatus: RelationshipStatus;
  relationshipScore: number;
  hasChildren: boolean;
  childrenCount: number;
  retirementTone?: string;
  retirementMoodLabel?: string;
  emotionalLegacy: string;
  financialLegacy: string;
}

export interface GameState {
  stats: CharacterStats;
  time: TimeState;
  purchasedUpgrades: string[];
  history: HistoryEntry[];
  actionsSinceLastEvent: number;
  activeEvent: GameEvent | null;
  gameOver: GameOverState | null;
  totalActions: number;
  exhaustionCounter: number;
  currentCareerId: string;
  currentHousingId: string;
  ownedHousingIds: string[];
  ownedBusinessIds: string[];
  characterName: string;
  originId: OriginId;
  traitId: TraitId;
  profileComplete: boolean;
  completedObjectiveIds: string[];
  unlockedAchievementIds: string[];
  achievementUnlockMeta: Record<string, AchievementUnlockMeta>;
  difficultyId: DifficultyId;
  businessLevels: Record<string, number>;
  isRetired: boolean;
  relationshipStatus: RelationshipStatus;
  relationshipScore: number;
  fame: number;
  lifePathTracking: LifePathTracking;
  tracking: GameTracking;
  lifeDiary: LifeDiaryEntry[];
  partnerName?: string;
  exPartnerName?: string;
  relationshipStartedAt?: TimeState;
  hasChildren: boolean;
  childrenCount: number;
  unlockedMemories: MemoryId[];
  pendingConsequences: ConsequenceTag[];
}

export interface LifePhase {
  id: string;
  label: string;
  minAge: number;
  maxAge: number;
}

export interface ActionComputeResult {
  effects: StatDelta;
  flags: {
    lowEnergyWork?: boolean;
    lowMentalStudy?: boolean;
    trainingInjury?: boolean;
    investGain?: boolean;
    investLoss?: boolean;
    investNeutral?: boolean;
  };
}

export interface MonthlyCycleResult {
  stats: CharacterStats;
  messages: string[];
  totalExpenses: number;
  totalIncome: number;
  paidInFull: boolean;
}

export interface PatrimonyContext {
  purchasedUpgrades: string[];
  ownedHousingIds: string[];
  ownedBusinessIds: string[];
  businessLevels?: Record<string, number>;
}

export const STAT_LIMITS = {
  min: 0,
  max: 100,
} as const;

export const DEBT_THRESHOLD = -500;
export const LOW_ENERGY_THRESHOLD = 25;
export const LOW_MENTAL_THRESHOLD = 40;
export const BURNOUT_THRESHOLD = 3;
export const MIN_REPUTATION_FOR_PROMOTION = 25;

export const INITIAL_AGE = 18;
export const INITIAL_MONTH = 1;
export const INITIAL_CAREER_ID = 'unemployed';
export const INITIAL_HOUSING_ID = 'simple_room';
export const DEFAULT_ORIGIN_ID: OriginId = 'middle_class';
export const DEFAULT_TRAIT_ID: TraitId = 'resilient';

export function createDefaultLifePathTracking(): LifePathTracking {
  return {
    corporate: 0,
    entrepreneur: 0,
    tech: 0,
    digital_influence: 0,
    investments: 0,
    balanced: 0,
  };
}
