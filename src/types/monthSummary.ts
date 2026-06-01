import type { CharacterStats } from './game';

export type MonthBreakdownType = 'positive' | 'negative' | 'neutral' | 'warning';

export interface StatChangeSummary {
  key: keyof CharacterStats | 'fame' | 'relationshipScore';
  label: string;
  before: number;
  after: number;
  delta: number;
}

export interface MonthBreakdownItem {
  label: string;
  amount?: number;
  type: MonthBreakdownType;
}

export interface LastMonthSummary {
  id: string;
  fromMonth: number;
  toMonth: number;
  fromAge: number;
  toAge: number;
  actionName: string;
  statChanges: StatChangeSummary[];
  breakdown: MonthBreakdownItem[];
  createdAt: string;
}

export interface MonthTransitionState {
  id: string;
  fromMonth: number;
  toMonth: number;
  fromAge: number;
  toAge: number;
}

export interface TurnSnapshot {
  stats: CharacterStats;
  fame: number;
  relationshipScore: number;
}
