import type { GameAction, StatDelta, TimeState } from '../types/game';
import type {
  LastMonthSummary,
  MonthBreakdownItem,
  StatChangeSummary,
  TurnSnapshot,
} from '../types/monthSummary';

const STAT_LABELS: Record<string, string> = {
  money: 'Dinheiro',
  energy: 'Energia',
  physicalHealth: 'Saúde física',
  mentalHealth: 'Saúde mental',
  happiness: 'Felicidade',
  reputation: 'Reputação',
  stress: 'Estresse',
  intelligence: 'Inteligência',
  charisma: 'Carisma',
  fame: 'Fama',
  relationshipScore: 'Relacionamento',
};

function formatMoneyDelta(delta: number): string {
  const sign = delta >= 0 ? '+' : '-';
  return `${sign}R$ ${Math.abs(delta).toLocaleString('pt-BR')}`;
}

function formatStatDelta(key: string, delta: number): string {
  if (key === 'money') return formatMoneyDelta(delta);
  const sign = delta >= 0 ? '+' : '';
  return `${sign}${delta}`;
}

export function buildActionBreakdown(
  action: GameAction,
  effects: StatDelta,
): MonthBreakdownItem[] {
  const items: MonthBreakdownItem[] = [
    { label: `Ação: ${action.name}`, type: 'neutral' },
  ];

  if (effects.money !== undefined && effects.money !== 0) {
    items.push({
      label: `Renda da ação: ${formatMoneyDelta(effects.money)}`,
      amount: effects.money,
      type: effects.money > 0 ? 'positive' : 'negative',
    });
  }

  if (effects.stress !== undefined && effects.stress !== 0) {
    items.push({
      label: `Estresse da ação: ${effects.stress > 0 ? '+' : ''}${effects.stress}`,
      amount: effects.stress,
      type: effects.stress > 0 ? 'negative' : 'positive',
    });
  }

  if (effects.energy !== undefined && effects.energy !== 0) {
    items.push({
      label: `Energia: ${effects.energy > 0 ? '+' : ''}${effects.energy}`,
      type: effects.energy > 0 ? 'positive' : 'negative',
    });
  }

  return items;
}

export function buildStatChanges(
  before: TurnSnapshot,
  after: TurnSnapshot,
): StatChangeSummary[] {
  const changes: StatChangeSummary[] = [];

  (Object.keys(before.stats) as (keyof typeof before.stats)[]).forEach((key) => {
    const b = before.stats[key];
    const a = after.stats[key];
    if (b === a) return;
    changes.push({
      key,
      label: STAT_LABELS[key] ?? key,
      before: b,
      after: a,
      delta: a - b,
    });
  });

  if (before.fame !== after.fame) {
    changes.push({
      key: 'fame',
      label: STAT_LABELS.fame,
      before: before.fame,
      after: after.fame,
      delta: after.fame - before.fame,
    });
  }

  if (before.relationshipScore !== after.relationshipScore) {
    changes.push({
      key: 'relationshipScore',
      label: STAT_LABELS.relationshipScore,
      before: before.relationshipScore,
      after: after.relationshipScore,
      delta: after.relationshipScore - before.relationshipScore,
    });
  }

  const priority = (c: StatChangeSummary) => {
    if (c.key === 'money' || c.key === 'stress') return 0;
    return 1;
  };

  return changes.sort((a, b) => priority(a) - priority(b));
}

export function buildLastMonthSummary(params: {
  before: TurnSnapshot;
  after: TurnSnapshot;
  beforeTime: TimeState;
  afterTime: TimeState;
  actionName: string;
  breakdown: MonthBreakdownItem[];
}): LastMonthSummary {
  return {
    id: crypto.randomUUID(),
    fromMonth: params.beforeTime.month,
    toMonth: params.afterTime.month,
    fromAge: params.beforeTime.age,
    toAge: params.afterTime.age,
    actionName: params.actionName,
    statChanges: buildStatChanges(params.before, params.after),
    breakdown: params.breakdown,
    createdAt: new Date().toISOString(),
  };
}

export function formatStatChangeLine(change: StatChangeSummary): string {
  const deltaStr = formatStatDelta(change.key, change.delta);
  if (change.key === 'money') {
    return `${change.label}: R$ ${change.before.toLocaleString('pt-BR')} → R$ ${change.after.toLocaleString('pt-BR')} (${deltaStr})`;
  }
  return `${change.label}: ${change.before} → ${change.after} (${deltaStr})`;
}
