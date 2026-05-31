import { LIFE_PATH_MAP } from '../data/lifePaths';
import { ORIGIN_MAP } from '../data/origins';
import { TRAIT_MAP } from '../data/traits';
import type { GameOverState, GameState, GameOverType, LifePathId } from '../types/game';
import { getCareer } from './careerLogic';
import { getDiaryHighlights } from './lifeDiaryLogic';
import { getDominantLifePath } from './lifePathLogic';
import { getMemoryTitles } from './memoryLogic';
import { getRelationshipDisplayLabel } from './partnerLogic';
import {
  buildRetirementTone,
  getRetirementMood,
  getRetirementMoodLabel,
} from './retirementNarrativeLogic';

export interface BiographyInput extends Pick<
  GameState,
  | 'characterName'
  | 'originId'
  | 'traitId'
  | 'lifeDiary'
  | 'partnerName'
  | 'exPartnerName'
  | 'relationshipStatus'
  | 'relationshipScore'
  | 'hasChildren'
  | 'childrenCount'
  | 'unlockedMemories'
  | 'lifePathTracking'
  | 'currentCareerId'
  | 'ownedBusinessIds'
  | 'tracking'
> {
  stats: GameState['stats'];
  time: GameState['time'];
  patrimony: number;
  type: GameOverType;
  monthsLived: number;
}

export function buildFinancialLegacy(patrimony: number, money: number): string {
  if (patrimony >= 15000) {
    return `Deixou um patrimônio de R$ ${patrimony.toLocaleString('pt-BR')} — riqueza que fala por si.`;
  }
  if (patrimony >= 5000) {
    return `Construiu R$ ${patrimony.toLocaleString('pt-BR')} em patrimônio, com R$ ${money.toLocaleString('pt-BR')} em caixa.`;
  }
  if (patrimony >= 1500) {
    return `Terminou com patrimônio modesto de R$ ${patrimony.toLocaleString('pt-BR')}, longe da ruína.`;
  }
  if (money < 0) {
    return 'O legado financeiro ficou marcado por dívidas e incerteza.';
  }
  return 'O legado financeiro foi simples — nem riqueza, nem desastre.';
}

export function buildEmotionalLegacy(
  input: BiographyInput,
): string {
  const { stats, relationshipStatus, relationshipScore, hasChildren, partnerName } =
    input;

  if (relationshipStatus === 'married' && relationshipScore >= 60) {
    const who = partnerName ? ` com ${partnerName}` : '';
    return `No amor, construiu uma vida estável${who}${hasChildren ? ' e uma família presente' : ''}.`;
  }
  if (relationshipStatus === 'separated' || relationshipStatus === 'single') {
    if (input.exPartnerName) {
      return `O coração carregou marcas após ${input.exPartnerName} — solidão ou recomeço.`;
    }
  }
  if (stats.mentalHealth >= 65 && stats.happiness >= 60) {
    return 'Emocionalmente, encontrou paz interior apesar das batalhas.';
  }
  if (stats.mentalHealth < 35 || stats.stress >= 75) {
    return 'O legado emocional foi de cansaço profundo e feridas que não fecharam.';
  }
  return 'Emocionalmente, viveu altos e baixos como a maioria — nem santo, nem vilão.';
}

export function buildBiography(input: BiographyInput): string {
  const name = input.characterName;
  const origin = ORIGIN_MAP[input.originId].name.toLowerCase();
  const trait = TRAIT_MAP[input.traitId].name.toLowerCase();
  const dominantId = getDominantLifePath(input.lifePathTracking);
  const path = LIFE_PATH_MAP[dominantId as LifePathId]?.name ?? 'Vida Equilibrada';
  const career = getCareer(input.currentCareerId).name.toLowerCase();

  const highlights = getDiaryHighlights(input.lifeDiary, 5);
  const firstBiz = highlights.find((e) => e.title.includes('negócio'));
  const marriage = highlights.find((e) => e.title === 'Casamento');

  let text = `${name} nasceu em uma origem ${origin}, começou a jornada aos 18 anos com traço ${trait} e encontrou seu caminho em ${path}. `;

  if (firstBiz) {
    text += `Aos ${firstBiz.age}, deu um passo decisivo no mundo dos negócios. `;
  }
  if (marriage && marriage.partnerName) {
    text += `Aos ${marriage.age}, casou-se com ${marriage.partnerName}. `;
  } else if (input.partnerName && input.relationshipStatus === 'married') {
    text += `Construiu vida a dois com ${input.partnerName}. `;
  }

  text += `Encerrou como ${career}, com patrimônio de R$ ${input.patrimony.toLocaleString('pt-BR')}. `;

  if (input.type === 'mental_collapse') {
    text += 'Apesar das conquistas visíveis, o excesso de pressão cobrou um preço que a mente não suportou.';
  } else if (input.type === 'death') {
    text += 'A história terminou antes do que parecia possível — o corpo não acompanhou a ambição.';
  } else if (input.type === 'retirement') {
    const tone = buildRetirementTone(input);
    text += tone;
  } else {
    text += 'Cada escolha deixou uma marca — algumas douradas, outras silenciosas.';
  }

  return text;
}

export function enrichGameOver(
  base: Omit<
    GameOverState,
    | 'biography'
    | 'diaryHighlights'
    | 'positiveMemories'
    | 'negativeMemories'
    | 'partnerName'
    | 'exPartnerName'
    | 'relationshipStatus'
    | 'relationshipScore'
    | 'hasChildren'
    | 'childrenCount'
    | 'retirementTone'
    | 'emotionalLegacy'
    | 'financialLegacy'
  >,
  state: GameState,
): GameOverState {
  const memories = getMemoryTitles(state.unlockedMemories);
  const bioInput: BiographyInput = {
    characterName: state.characterName,
    originId: state.originId,
    traitId: state.traitId,
    lifeDiary: state.lifeDiary,
    partnerName: state.partnerName,
    exPartnerName: state.exPartnerName,
    relationshipStatus: state.relationshipStatus,
    relationshipScore: state.relationshipScore,
    hasChildren: state.hasChildren,
    childrenCount: state.childrenCount,
    unlockedMemories: state.unlockedMemories,
    lifePathTracking: state.lifePathTracking,
    currentCareerId: state.currentCareerId,
    ownedBusinessIds: state.ownedBusinessIds,
    tracking: state.tracking,
    stats: state.stats,
    time: state.time,
    patrimony: base.finalPatrimony,
    type: base.type,
    monthsLived: base.monthsLived,
  };

  return {
    ...base,
    biography: buildBiography(bioInput),
    diaryHighlights: getDiaryHighlights(state.lifeDiary, 8),
    positiveMemories: memories.positive,
    negativeMemories: memories.negative,
    partnerName: state.partnerName,
    exPartnerName: state.exPartnerName,
    relationshipStatus: state.relationshipStatus,
    relationshipScore: state.relationshipScore,
    hasChildren: state.hasChildren,
    childrenCount: state.childrenCount,
    retirementTone:
      base.type === 'retirement' ? buildRetirementTone(bioInput) : undefined,
    retirementMoodLabel:
      base.type === 'retirement'
        ? getRetirementMoodLabel(getRetirementMood(bioInput))
        : undefined,
    emotionalLegacy: buildEmotionalLegacy(bioInput),
    financialLegacy: buildFinancialLegacy(base.finalPatrimony, base.finalMoney),
  };
}

export function getFinalRelationsSummary(state: GameState): string {
  const rel = getRelationshipDisplayLabel(
    state.relationshipStatus,
    state.partnerName ?? state.exPartnerName,
  );
  const kids =
    state.hasChildren && state.childrenCount > 0
      ? ` · ${state.childrenCount} filho(s)`
      : '';
  return `${rel}${kids}`;
}
