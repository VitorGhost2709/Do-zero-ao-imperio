import type { MemoryId } from '../types/game';

export interface MemoryDefinition {
  id: MemoryId;
  title: string;
  description: string;
  tone: 'positive' | 'negative';
}

export const MEMORY_MAP: Record<MemoryId, MemoryDefinition> = {
  first_big_salary: {
    id: 'first_big_salary',
    title: 'Primeiro grande salário',
    description: 'O dia em que o esforço virou dinheiro de verdade na conta.',
    tone: 'positive',
  },
  unforgettable_trip: {
    id: 'unforgettable_trip',
    title: 'Viagem inesquecível',
    description: 'Um período longe da rotina que reacendeu a alma.',
    tone: 'positive',
  },
  happy_marriage: {
    id: 'happy_marriage',
    title: 'Casamento feliz',
    description: 'Promessas feitas com o coração aberto e esperança no futuro.',
    tone: 'positive',
  },
  life_changing_business: {
    id: 'life_changing_business',
    title: 'Negócio que mudou sua vida',
    description: 'O empreendimento que transformou sua identidade profissional.',
    tone: 'positive',
  },
  comeback: {
    id: 'comeback',
    title: 'Volta por cima',
    description: 'Depois de quase desistir, você encontrou força para recomeçar.',
    tone: 'positive',
  },
  traumatic_burnout: {
    id: 'traumatic_burnout',
    title: 'Burnout traumático',
    description: 'O corpo e a mente pediram socorro — e ninguém mais ignorou.',
    tone: 'negative',
  },
  suffocating_debt: {
    id: 'suffocating_debt',
    title: 'Dívida sufocante',
    description: 'As contas apertaram até faltar ar para sonhar.',
    tone: 'negative',
  },
  painful_breakup: {
    id: 'painful_breakup',
    title: 'Término doloroso',
    description: 'Um amor que terminou deixando marcas profundas.',
    tone: 'negative',
  },
  public_failure: {
    id: 'public_failure',
    title: 'Fracasso público',
    description: 'A vergonha de errar com muita gente assistindo.',
    tone: 'negative',
  },
  missed_opportunity: {
    id: 'missed_opportunity',
    title: 'Perda de oportunidade',
    description: 'A chance que passou e não voltou mais da mesma forma.',
    tone: 'negative',
  },
};
