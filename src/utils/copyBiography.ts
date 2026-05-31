import { DIFFICULTY_MAP } from '../data/difficulties';
import { LIFE_PATH_MAP } from '../data/lifePaths';
import { ORIGIN_MAP } from '../data/origins';
import { TRAIT_MAP } from '../data/traits';
import type { GameOverState } from '../types/game';
import { getCareer } from './careerLogic';

export function buildBiographyExportText(gameOver: GameOverState): string {
  const lines: string[] = [
    '═══ DO ZERO AO IMPÉRIO ═══',
    '',
    `Nome: ${gameOver.characterName}`,
    `Origem: ${ORIGIN_MAP[gameOver.originId]?.name ?? gameOver.originId}`,
    `Traço: ${TRAIT_MAP[gameOver.traitId]?.name ?? gameOver.traitId}`,
    `Dificuldade: ${DIFFICULTY_MAP[gameOver.difficultyId]?.name ?? 'Normal'}`,
    `Idade final: ${gameOver.finalAge} anos`,
    `Carreira: ${getCareer(gameOver.finalCareerId).name}`,
    `Patrimônio: R$ ${gameOver.finalPatrimony.toLocaleString('pt-BR')}`,
    `Dinheiro em caixa: R$ ${gameOver.finalMoney.toLocaleString('pt-BR')}`,
    `Caminho: ${LIFE_PATH_MAP[gameOver.dominantLifePathId]?.name ?? 'Vida Equilibrada'}`,
    `Classificação: ${gameOver.lifeClassificationLabel}`,
    '',
    '── Biografia ──',
    gameOver.biography || gameOver.lifeSummary,
    '',
  ];

  if (gameOver.diaryHighlights?.length) {
    lines.push('── Marcos da vida ──');
    gameOver.diaryHighlights.forEach((e) => {
      lines.push(`• ${e.age}a/m${e.month} — ${e.title}${e.partnerName ? ` (${e.partnerName})` : ''}`);
    });
    lines.push('');
  }

  if (gameOver.positiveMemories?.length) {
    lines.push('── Melhores memórias ──');
    gameOver.positiveMemories.forEach((m) => lines.push(`• ${m}`));
    lines.push('');
  }

  if (gameOver.negativeMemories?.length) {
    lines.push('── Piores memórias ──');
    gameOver.negativeMemories.forEach((m) => lines.push(`• ${m}`));
    lines.push('');
  }

  lines.push('── Legado ──');
  lines.push(gameOver.emotionalLegacy || '');
  lines.push(gameOver.financialLegacy || '');

  return lines.filter((l) => l !== undefined).join('\n');
}

export async function copyBiographyToClipboard(
  text: string,
): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fallback abaixo */
  }
  return false;
}
