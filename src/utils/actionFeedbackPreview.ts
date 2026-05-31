import type { ActionId, StatDelta } from '../types/game';

export interface EffectLine {
  text: string;
  variant: 'positive' | 'negative' | 'neutral';
}

const LABELS: Partial<Record<keyof StatDelta, string>> = {
  money: 'dinheiro',
  energy: 'energia',
  physicalHealth: 'saúde física',
  mentalHealth: 'saúde mental',
  happiness: 'felicidade',
  reputation: 'reputação',
  stress: 'estresse',
  intelligence: 'inteligência',
  charisma: 'carisma',
};

export function formatEffectLines(effects: StatDelta): EffectLine[] {
  const lines: EffectLine[] = [];

  (Object.keys(effects) as (keyof StatDelta)[]).forEach((key) => {
    const val = effects[key];
    if (val === undefined || val === 0) return;

    const label = LABELS[key] ?? key;
    let text: string;
    let variant: EffectLine['variant'] = 'neutral';

    if (key === 'money') {
      text = val > 0 ? `+R$ ${val}` : `-R$ ${Math.abs(val)}`;
      variant = val > 0 ? 'positive' : 'negative';
    } else if (key === 'stress') {
      text = val > 0 ? `+${val} ${label}` : `${val} ${label}`;
      variant = val > 0 ? 'negative' : 'positive';
    } else {
      text = val > 0 ? `+${val} ${label}` : `${val} ${label}`;
      variant =
        val > 0
          ? ['energy', 'physicalHealth', 'mentalHealth', 'happiness', 'reputation', 'intelligence', 'charisma'].includes(key)
            ? 'positive'
            : 'negative'
          : 'negative';
    }

    lines.push({ text, variant });
  });

  return lines.slice(0, 5);
}

export const ACTION_FEEDBACK_ID: Record<ActionId, string> = {
  work: 'work',
  study: 'study',
  rest: 'rest',
  socialize: 'socialize',
  train: 'train',
  invest: 'invest',
};
