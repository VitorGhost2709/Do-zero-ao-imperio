import type { HistoryEntryType } from '../types/game';

export function classifyHistoryMessage(message: string): HistoryEntryType {
  const m = message.toLowerCase();
  if (
    m.includes('colapso') ||
    m.includes('desmaiou') ||
    m.includes('burnout') ||
    m.includes('crise')
  ) {
    return 'crisis';
  }
  if (m.includes('conquista desbloqueada')) return 'achievement';
  if (m.includes('objetivo concluído')) return 'objective';
  if (m.includes('comprou') && m.includes('negócio')) return 'business';
  if (m.includes('investiu em') && m.includes('negócios')) return 'business';
  if (m.includes('renda passiva') || m.includes('negócios geraram'))
    return 'business';
  if (
    m.includes('alugou') ||
    m.includes('comprou') && (m.includes('apartamento') || m.includes('casa') || m.includes('mansão') || m.includes('kitnet') || m.includes('cobertura') || m.includes('morar'))
  ) {
    return 'housing';
  }
  if (m.includes('mudou de carreira') || m.includes('trabalha como'))
    return 'career';
  if (m.includes('contas do mês') || m.includes('dívidas'))
    return 'monthly';
  if (
    m.includes('trabalhou') ||
    m.includes('estudou') ||
    m.includes('descansou') ||
    m.includes('socializou') ||
    m.includes('treinou') ||
    m.includes('investiu')
  ) {
    return 'action';
  }
  return 'event';
}

export function parseAgeFromMessage(message: string): number | null {
  const match = message.match(/Aos (\d+) anos/);
  return match ? parseInt(match[1], 10) : null;
}

export function groupHistoryByAge(
  entries: { message: string; id: string }[],
): Map<number, typeof entries> {
  const groups = new Map<number, typeof entries>();
  entries.forEach((entry) => {
    const age = parseAgeFromMessage(entry.message) ?? 0;
    const list = groups.get(age) ?? [];
    list.push(entry);
    groups.set(age, list);
  });
  return new Map([...groups.entries()].sort((a, b) => b[0] - a[0]));
}
