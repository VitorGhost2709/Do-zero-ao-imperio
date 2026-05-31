import type { LifePathId } from '../types/game';

export interface LifePathDefinition {
  id: LifePathId;
  name: string;
  description: string;
  icon: string;
}

export const LIFE_PATHS: LifePathDefinition[] = [
  {
    id: 'corporate',
    name: 'Vida Corporativa',
    description: 'Escalando hierarquias, bônus e política de escritório.',
    icon: 'Briefcase',
  },
  {
    id: 'entrepreneur',
    name: 'Empreendedorismo',
    description: 'Negócios próprios, risco e renda passiva.',
    icon: 'Building2',
  },
  {
    id: 'tech',
    name: 'Tecnologia',
    description: 'Estudo, código e inovação como motor da vida.',
    icon: 'Cpu',
  },
  {
    id: 'digital_influence',
    name: 'Influência Digital',
    description: 'Reputação, carisma e presença pública.',
    icon: 'Megaphone',
  },
  {
    id: 'investments',
    name: 'Investimentos',
    description: 'Dinheiro trabalhando — e às vezes sangrando.',
    icon: 'TrendingUp',
  },
  {
    id: 'balanced',
    name: 'Vida Equilibrada',
    description: 'Saúde, felicidade e estabilidade em primeiro lugar.',
    icon: 'Scale',
  },
];

export const LIFE_PATH_MAP = Object.fromEntries(
  LIFE_PATHS.map((p) => [p.id, p]),
) as Record<LifePathId, LifePathDefinition>;
