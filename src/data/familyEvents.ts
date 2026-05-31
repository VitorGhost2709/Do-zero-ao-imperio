import type { GameEvent } from '../types/game';

export const FAMILY_EVENTS: GameEvent[] = [
  {
    id: 'fam_talk_children',
    title: 'Conversa sobre ter filhos',
    category: 'family',
    riskLevel: 'medium',
    requiresRelationship: ['dating', 'married'],
    minRelationshipMonths: 18,
    requiresNoChildren: true,
    description:
      'A conversa ficou séria: filhos, futuro e o que vocês realmente querem da vida.',
    choices: [
      {
        id: 'want_kids',
        label: 'Dizer que quer filhos em breve',
        effects: { happiness: 8, relationshipScore: 12, stress: 6 },
        historyMessage: 'vocês alinharam o desejo de construir uma família.',
      },
      {
        id: 'not_now',
        label: 'Pedir mais tempo',
        effects: { relationshipScore: -4, mentalHealth: 4 },
        historyMessage: 'você pediu tempo antes de decidir sobre filhos.',
      },
      {
        id: 'against_kids',
        label: 'Dizer que não quer filhos',
        effects: { relationshipScore: -14, happiness: -4, stress: 8 },
        historyMessage: 'a conversa sobre filhos gerou tensão no casal.',
      },
    ],
  },
  {
    id: 'fam_child_born',
    title: 'Nascimento de um filho',
    category: 'family',
    riskLevel: 'high',
    requiresRelationship: ['married', 'dating'],
    minRelationshipMonths: 24,
    requiresNoChildren: true,
    description:
      'A notícia chegou: um filho está a caminho. A vida nunca mais será a mesma.',
    choices: [
      {
        id: 'embrace_parent',
        label: 'Abraçar a paternidade/maternidade',
        effects: { money: -150, happiness: 18, mentalHealth: 6, stress: 14 },
        hasChildren: true,
        childrenDelta: 1,
        memoryId: 'happy_marriage',
        diaryMilestoneId: 'first_child',
        historyMessage: 'nasceu seu primeiro filho — a família cresceu.',
      },
      {
        id: 'panic_parent',
        label: 'Entrar em pânico financeiro',
        effects: { money: -80, stress: 20, happiness: -6, mentalHealth: -8 },
        hasChildren: true,
        childrenDelta: 1,
        diaryMilestoneId: 'first_child',
        historyMessage: 'o filho nasceu em meio a medo e incerteza financeira.',
      },
    ],
  },
  {
    id: 'fam_child_sick',
    title: 'Filho ficou doente',
    category: 'family',
    riskLevel: 'medium',
    requiresChildren: true,
    description:
      'Seu filho passou mal de madrugada. O medo de pai/mãe apertou o peito.',
    choices: [
      {
        id: 'take_care',
        label: 'Faltar ao trabalho e cuidar',
        effects: { money: -60, happiness: 6, relationshipScore: 10, stress: 8 },
        historyMessage: 'você priorizou o filho doente e a família agradeceu.',
      },
      {
        id: 'delegate_care',
        label: 'Delegar e seguir trabalhando',
        effects: { money: 40, happiness: -10, stress: 12, relationshipScore: -8 },
        historyMessage: 'você não esteve presente quando seu filho mais precisou.',
      },
    ],
  },
  {
    id: 'fam_child_attention',
    title: 'Filho pediu atenção',
    category: 'family',
    riskLevel: 'low',
    requiresChildren: true,
    description:
      '"Papai/Mamãe, você some demais." A frase de um filho dói mais que qualquer crítica.',
    choices: [
      {
        id: 'play_day',
        label: 'Reservar um dia só para ele',
        effects: { money: -35, happiness: 12, stress: -6, energy: -8 },
        historyMessage: 'você dedicou um dia inteiro ao seu filho.',
      },
      {
        id: 'promise_later',
        label: 'Prometer para depois',
        effects: { money: 50, happiness: -8, stress: 6 },
        consequenceTag: 'promised_partner_change',
        historyMessage: 'você adiou mais uma vez — a culpa ficou.',
      },
    ],
  },
  {
    id: 'fam_family_trip',
    title: 'Família quer viajar',
    category: 'family',
    riskLevel: 'medium',
    requiresRelationship: ['dating', 'married'],
    description:
      'Uma viagem em família surgiu como oportunidade de reconectar — se você topar.',
    choices: [
      {
        id: 'take_trip',
        label: 'Viajar juntos',
        effects: { money: -200, happiness: 16, mentalHealth: 10, stress: -10 },
        memoryId: 'unforgettable_trip',
        diaryMilestoneId: 'family_trip',
        historyMessage: 'a viagem em família virou memória querida.',
      },
      {
        id: 'skip_trip',
        label: 'Recusar por dinheiro/trabalho',
        effects: { money: 80, happiness: -10, relationshipScore: -12, stress: 8 },
        historyMessage: 'você recusou a viagem e a família ficou decepcionada.',
      },
    ],
  },
  {
    id: 'fam_work_conflict',
    title: 'Conflito entre trabalho e família',
    category: 'family',
    riskLevel: 'high',
    requiresRelationship: ['dating', 'married'],
    description:
      'Reunião crucial no mesmo dia do evento da escola do filho. Impossível estar nos dois lugares.',
    choices: [
      {
        id: 'choose_family',
        label: 'Ir ao evento da família',
        effects: { money: -90, happiness: 14, relationshipScore: 16, reputation: -4 },
        historyMessage: 'você escolheu a família em vez do trabalho.',
      },
      {
        id: 'choose_work',
        label: 'Priorizar o trabalho',
        effects: { money: 120, happiness: -12, relationshipScore: -18, stress: 14 },
        consequenceTag: 'fought_with_partner',
        historyMessage: 'você faltou ao momento importante da família.',
      },
    ],
  },
];
