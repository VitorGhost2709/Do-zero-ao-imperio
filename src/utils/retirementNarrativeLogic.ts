import type { BiographyInput } from './biographyLogic';

export type RetirementMoodId =
  | 'lonely_rich'
  | 'simple_happy'
  | 'legendary'
  | 'bitter'
  | 'family';

export function getRetirementMood(input: BiographyInput): RetirementMoodId {
  const { stats, patrimony, relationshipStatus, relationshipScore, hasChildren } =
    input;

  if (
    hasChildren &&
    relationshipScore >= 50 &&
    (relationshipStatus === 'married' || relationshipStatus === 'dating')
  ) {
    return 'family';
  }
  if (patrimony >= 12000 && stats.happiness >= 55) {
    return 'legendary';
  }
  if (patrimony >= 8000 && relationshipStatus === 'single') {
    return 'lonely_rich';
  }
  if (stats.happiness >= 65 && patrimony < 4000) {
    return 'simple_happy';
  }
  if (stats.happiness < 40 || stats.mentalHealth < 40) {
    return 'bitter';
  }
  if (patrimony >= 5000) return 'lonely_rich';
  return 'simple_happy';
}

const RETIREMENT_PHRASES: Record<RetirementMoodId, string> = {
  lonely_rich:
    ' A aposentadoria chegou com conforto financeiro, mas o silêncio da casa pesou nas noites.',
  simple_happy:
    ' Aposentou-se sem luxo, porém com leveza no coração — uma vida simples que valeu a pena.',
  legendary:
    ' Aos 60+, encerrou em alto estilo: patrimônio, história e um nome que ecoa.',
  bitter:
    ' A aposentadoria trouxe tempo demais para pensar no que não deu certo.',
  family:
    ' Aposentou-se cercado de família — o legado que mais importava não estava no banco.',
};

export function buildRetirementTone(input: BiographyInput): string {
  return RETIREMENT_PHRASES[getRetirementMood(input)];
}

export function getRetirementMoodLabel(mood: RetirementMoodId): string {
  const labels: Record<RetirementMoodId, string> = {
    lonely_rich: 'Aposentadoria solitária e rica',
    simple_happy: 'Aposentadoria simples e feliz',
    legendary: 'Aposentadoria lendária',
    bitter: 'Aposentadoria amarga',
    family: 'Aposentadoria familiar',
  };
  return labels[mood];
}
