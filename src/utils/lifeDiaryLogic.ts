import type {
  GameState,
  LifeDiaryEntry,
  LifeDiaryEntryType,
  TimeState,
} from '../types/game';
import { INITIAL_CAREER_ID, INITIAL_HOUSING_ID } from '../types/game';
import { calculatePatrimony } from './gameLogic';
import { getPatrimonyContext } from './storage';

const MAX_DIARY_ENTRIES = 48;

export interface DiaryMilestoneTemplate {
  id: string;
  title: string;
  description: string;
  type: LifeDiaryEntryType;
}

export const DIARY_MILESTONE_TEMPLATES: Record<string, DiaryMilestoneTemplate> = {
  character_created: {
    id: 'character_created',
    title: 'Início da jornada',
    description:
      'Um novo capítulo começou aos 18 anos — incerteza, sonhos e coragem.',
    type: 'legacy',
  },
  first_promotion: {
    id: 'first_promotion',
    title: 'Primeira promoção',
    description: 'O primeiro degrau profissional confirmou que você podia subir.',
    type: 'career',
  },
  first_housing_move: {
    id: 'first_housing_move',
    title: 'Primeira moradia própria',
    description: 'Saiu do quarto simples e ganhou um espaço que era só seu.',
    type: 'housing',
  },
  first_business: {
    id: 'first_business',
    title: 'Primeiro negócio',
    description: 'Empreender deixou de ser sonho e virou responsabilidade real.',
    type: 'business',
  },
  first_dating: {
    id: 'first_dating',
    title: 'Primeiro namoro',
    description: 'O coração abriu espaço para alguém especial na rotina.',
    type: 'love',
  },
  marriage: {
    id: 'marriage',
    title: 'Casamento',
    description: 'Duas vidas oficialmente entrelaçadas — promessas e planos.',
    type: 'love',
  },
  separation: {
    id: 'separation',
    title: 'Separação',
    description: 'Um capítulo de amor fechou com silêncio e aprendizado doloroso.',
    type: 'love',
  },
  heavy_loss: {
    id: 'heavy_loss',
    title: 'Primeiro grande prejuízo',
    description: 'O bolso sangrou — e a lição ficou gravada na memória.',
    type: 'money',
  },
  patrimony_10k: {
    id: 'patrimony_10k',
    title: 'Patrimônio de R$ 10.000',
    description:
      'A marca dos cinco dígitos no patrimônio trouxe alívio e orgulho.',
    type: 'money',
  },
  major_achievement: {
    id: 'major_achievement',
    title: 'Grande conquista',
    description: 'Um objetivo importante foi alcançado — prova de persistência.',
    type: 'achievement',
  },
  first_burnout: {
    id: 'first_burnout',
    title: 'Primeiro burnout',
    description: 'O corpo disse basta antes da mente admitir o cansaço.',
    type: 'health',
  },
  near_death: {
    id: 'near_death',
    title: 'Quase morreu',
    description: 'A saúde chegou ao limite — um aviso que não dá para ignorar.',
    type: 'tragedy',
  },
  entrepreneur_milestone: {
    id: 'entrepreneur_milestone',
    title: 'Virou empresário',
    description: 'Múltiplos negócios transformaram você em construtor de império.',
    type: 'business',
  },
  mansion: {
    id: 'mansion',
    title: 'Mansão conquistada',
    description: 'O topo da moradia — luxo, status e um novo patamar de vida.',
    type: 'housing',
  },
  retirement: {
    id: 'retirement',
    title: 'Aposentadoria',
    description: 'Aos 60+, você escolheu encerrar a corrida e olhar para trás.',
    type: 'legacy',
  },
  game_end_death: {
    id: 'game_end_death',
    title: 'Fim da vida',
    description:
      'A jornada terminou antes do tempo — legado misturado a arrependimentos.',
    type: 'tragedy',
  },
  game_end_collapse: {
    id: 'game_end_collapse',
    title: 'Colapso',
    description: 'A mente não resistiu à pressão acumulada por anos.',
    type: 'tragedy',
  },
  first_child: {
    id: 'first_child',
    title: 'Nascimento do primeiro filho',
    description: 'Uma nova vida trouxe responsabilidade, medo e amor imenso.',
    type: 'family',
  },
  family_trip: {
    id: 'family_trip',
    title: 'Viagem em família',
    description: 'Longe da rotina, vocês se reconectaram de um jeito raro.',
    type: 'family',
  },
  relationship_crisis: {
    id: 'relationship_crisis',
    title: 'Crise no relacionamento',
    description: 'Promessas quebradas cobraram seu preço emocional.',
    type: 'love',
  },
};

export function hasDiaryMilestone(
  diary: LifeDiaryEntry[],
  milestoneId: string,
): boolean {
  const template = DIARY_MILESTONE_TEMPLATES[milestoneId];
  if (!template) return false;
  return diary.some(
    (e) => e.id === milestoneId || e.title === template.title,
  );
}

export function addDiaryMilestone(
  diary: LifeDiaryEntry[],
  milestoneId: string,
  time: TimeState,
  partnerName?: string,
  customDescription?: string,
): LifeDiaryEntry[] {
  const template = DIARY_MILESTONE_TEMPLATES[milestoneId];
  if (!template || hasDiaryMilestone(diary, milestoneId)) return diary;

  const entry: LifeDiaryEntry = {
    id: milestoneId,
    age: time.age,
    month: time.month,
    title: template.title,
    description: customDescription ?? template.description,
    type: template.type,
    partnerName,
  };

  return [entry, ...diary].slice(0, MAX_DIARY_ENTRIES);
}

export function addCustomDiaryEntry(
  diary: LifeDiaryEntry[],
  entry: Omit<LifeDiaryEntry, 'id'>,
): LifeDiaryEntry[] {
  const full: LifeDiaryEntry = { ...entry, id: crypto.randomUUID() };
  return [full, ...diary].slice(0, MAX_DIARY_ENTRIES);
}

export function getDiaryHighlights(
  diary: LifeDiaryEntry[],
  limit = 8,
): LifeDiaryEntry[] {
  const priority = new Set([
    'Aposentadoria',
    'Casamento',
    'Mansão conquistada',
    'Virou empresário',
    'Primeiro negócio',
    'Patrimônio de R$ 10.000',
    'Primeiro namoro',
    'Colapso',
    'Fim da vida',
  ]);

  const sorted = [...diary].sort((a, b) => {
    const aPri = priority.has(a.title) ? 1 : 0;
    const bPri = priority.has(b.title) ? 1 : 0;
    if (aPri !== bPri) return bPri - aPri;
    return b.age - a.age || b.month - a.month;
  });

  return sorted.slice(0, limit);
}

export interface DiaryCheckContext {
  prevCareerId?: string;
  newCareerId?: string;
  prevHousingId?: string;
  newHousingId?: string;
  prevBusinessCount?: number;
  newBusinessCount?: number;
  prevRelationshipStatus?: GameState['relationshipStatus'];
  newRelationshipStatus?: GameState['relationshipStatus'];
  moneyDelta?: number;
  hadBurnout?: boolean;
  hadNearDeath?: boolean;
  completedObjective?: boolean;
  gameOverType?: 'death' | 'mental_collapse' | 'retirement';
}

export function applyDiaryChecks(
  state: GameState,
  ctx: DiaryCheckContext,
): LifeDiaryEntry[] {
  let diary = state.lifeDiary;
  const { time, partnerName } = state;
  const assets = getPatrimonyContext(state);
  const patrimony = calculatePatrimony(state.stats, assets);

  if (
    ctx.newCareerId &&
    ctx.prevCareerId === INITIAL_CAREER_ID &&
    ctx.newCareerId !== INITIAL_CAREER_ID
  ) {
    diary = addDiaryMilestone(diary, 'first_promotion', time);
  }

  if (
    ctx.newHousingId &&
    ctx.prevHousingId === INITIAL_HOUSING_ID &&
    ctx.newHousingId !== INITIAL_HOUSING_ID
  ) {
    diary = addDiaryMilestone(diary, 'first_housing_move', time);
  }

  if (ctx.newHousingId === 'mansion') {
    diary = addDiaryMilestone(diary, 'mansion', time);
  }

  if (
    ctx.newBusinessCount !== undefined &&
    ctx.prevBusinessCount === 0 &&
    ctx.newBusinessCount > 0
  ) {
    diary = addDiaryMilestone(diary, 'first_business', time);
  }

  if (
    ctx.newBusinessCount !== undefined &&
    ctx.newBusinessCount >= 2 &&
    !hasDiaryMilestone(diary, 'entrepreneur_milestone')
  ) {
    diary = addDiaryMilestone(diary, 'entrepreneur_milestone', time);
  }

  if (
    ctx.newRelationshipStatus === 'dating' &&
    ctx.prevRelationshipStatus === 'single'
  ) {
    diary = addDiaryMilestone(diary, 'first_dating', time, partnerName);
  }

  if (
    ctx.newRelationshipStatus === 'married' &&
    ctx.prevRelationshipStatus !== 'married'
  ) {
    diary = addDiaryMilestone(diary, 'marriage', time, partnerName);
  }

  if (
    (ctx.newRelationshipStatus === 'separated' ||
      ctx.newRelationshipStatus === 'single') &&
    (ctx.prevRelationshipStatus === 'dating' ||
      ctx.prevRelationshipStatus === 'married')
  ) {
    diary = addDiaryMilestone(
      diary,
      'separation',
      time,
      partnerName ?? state.exPartnerName,
    );
  }

  if (ctx.moneyDelta !== undefined && ctx.moneyDelta <= -150) {
    diary = addDiaryMilestone(diary, 'heavy_loss', time);
  }

  if (patrimony >= 10000 && !hasDiaryMilestone(diary, 'patrimony_10k')) {
    diary = addDiaryMilestone(diary, 'patrimony_10k', time);
  }

  if (ctx.hadBurnout) {
    diary = addDiaryMilestone(diary, 'first_burnout', time);
  }

  if (ctx.hadNearDeath) {
    diary = addDiaryMilestone(diary, 'near_death', time);
  }

  if (ctx.completedObjective) {
    diary = addDiaryMilestone(diary, 'major_achievement', time);
  }

  if (ctx.gameOverType === 'death') {
    diary = addDiaryMilestone(diary, 'game_end_death', time);
  }
  if (ctx.gameOverType === 'mental_collapse') {
    diary = addDiaryMilestone(diary, 'game_end_collapse', time);
  }
  if (ctx.gameOverType === 'retirement') {
    diary = addDiaryMilestone(diary, 'retirement', time);
  }

  return diary;
}
