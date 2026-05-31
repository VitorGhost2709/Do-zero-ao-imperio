import type { EventChoice } from '../types/game';

export interface ChoicePreview {
  lines: string[];
  isRisky: boolean;
  warnings: string[];
}

export function getChoicePreview(choice: EventChoice): ChoicePreview {
  const lines: string[] = [];
  const warnings: string[] = [];
  let riskScore = 0;

  const e = choice.effects;
  if (e.money !== undefined) {
    lines.push(
      e.money >= 0 ? `+R$ ${e.money}` : `-R$ ${Math.abs(e.money)}`,
    );
    if (e.money < -50) riskScore += 2;
  }
  if (e.energy !== undefined && e.energy < 0)
    lines.push(`${e.energy} energia`);
  if (e.stress !== undefined && e.stress > 0) {
    lines.push(`+${e.stress} estresse`);
    if (e.stress >= 15) riskScore += 2;
  }
  if (e.mentalHealth !== undefined && e.mentalHealth < 0) {
    lines.push(`${e.mentalHealth} saúde mental`);
    riskScore += 2;
  }
  if (e.physicalHealth !== undefined && e.physicalHealth < 0)
    lines.push(`${e.physicalHealth} saúde física`);
  if (e.reputation !== undefined)
    lines.push(
      `${e.reputation >= 0 ? '+' : ''}${e.reputation} reputação`,
    );
  if (e.happiness !== undefined)
    lines.push(
      `${e.happiness >= 0 ? '+' : ''}${e.happiness} felicidade`,
    );
  if (e.intelligence !== undefined && e.intelligence > 0)
    lines.push(`+${e.intelligence} inteligência`);

  if (riskScore >= 3) warnings.push('Escolha arriscada');
  if (e.reputation !== undefined && e.reputation <= -10)
    warnings.push('Pode afetar sua reputação');
  if (e.stress !== undefined && e.stress >= 20)
    warnings.push('Pode causar grande estresse');
  if (e.mentalHealth !== undefined && e.mentalHealth <= -15)
    warnings.push('Pode prejudicar sua saúde mental');

  return {
    lines: lines.slice(0, 4),
    isRisky: riskScore >= 2 || warnings.length > 0,
    warnings,
  };
}

export function getEventRiskLevel(
  event: { riskLevel?: string; isRare?: boolean },
): 'low' | 'medium' | 'high' | 'extreme' {
  if (event.riskLevel) return event.riskLevel as 'low' | 'medium' | 'high' | 'extreme';
  return event.isRare ? 'high' : 'medium';
}
