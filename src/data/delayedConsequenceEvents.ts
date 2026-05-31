import type { GameEvent } from '../types/game';

/** Eventos que só aparecem quando uma escolha anterior deixou uma tag pendente */
export const DELAYED_CONSEQUENCE_EVENTS: GameEvent[] = [
  {
    id: 'delay_partner_promise',
    title: 'A promessa voltou',
    category: 'relationship',
    riskLevel: 'high',
    requiresConsequence: 'promised_partner_change',
    requiresRelationship: ['dating', 'married'],
    description:
      'Seu parceiro cobrou a promessa antiga. O silêncio na sala dizia tudo.',
    choices: [
      {
        id: 'admit_fail',
        label: 'Admitir que falhou',
        effects: { relationshipScore: -22, stress: 14, mentalHealth: -8, happiness: -6 },
        clearsConsequence: 'promised_partner_change',
        memoryId: 'painful_breakup',
        diaryMilestoneId: 'relationship_crisis',
        historyMessage: 'você admitiu que não cumpriu a promessa — a crise explodiu.',
      },
      {
        id: 'make_real_change',
        label: 'Mudar de verdade agora',
        effects: { energy: -15, relationshipScore: 12, stress: -8, money: -40 },
        clearsConsequence: 'promised_partner_change',
        historyMessage: 'você finalmente honrou a promessa com ações.',
      },
    ],
  },
  {
    id: 'delay_dubious_deal',
    title: 'A proposta duvidosa retornou',
    category: 'money',
    riskLevel: 'extreme',
    requiresConsequence: 'dubious_proposal_accepted',
    description:
      'O acordo suspeito que você aceitou voltou com cobrança — e consequências legais no horizonte.',
    choices: [
      {
        id: 'pay_price',
        label: 'Pagar para encerrar',
        effects: { money: -250, reputation: -12, stress: 18 },
        clearsConsequence: 'dubious_proposal_accepted',
        memoryId: 'public_failure',
        historyMessage: 'você pagou caro pelo acordo duvidoso do passado.',
      },
      {
        id: 'deny',
        label: 'Negar envolvimento',
        effects: { reputation: -20, fame: -8, stress: 22 },
        clearsConsequence: 'dubious_proposal_accepted',
        memoryId: 'public_failure',
        historyMessage: 'a mentira sobre o acordo duvidoso explodiu na sua cara.',
      },
    ],
  },
  {
    id: 'delay_health_ignore',
    title: 'O corpo cobrou',
    category: 'health',
    riskLevel: 'high',
    requiresConsequence: 'ignored_health_warning',
    description:
      'Os sinais que você ignorou viraram sintomas sérios. O médico não suavizou as palavras.',
    choices: [
      {
        id: 'treat_now',
        label: 'Tratar de imediato',
        effects: { money: -120, physicalHealth: 15, mentalHealth: 8, stress: -6 },
        clearsConsequence: 'ignored_health_warning',
        historyMessage: 'você tratou a saúde antes que fosse tarde demais.',
      },
      {
        id: 'ignore_again',
        label: 'Ignorar de novo',
        effects: { physicalHealth: -18, mentalHealth: -12, stress: 16 },
        clearsConsequence: 'ignored_health_warning',
        memoryId: 'traumatic_burnout',
        historyMessage: 'você ignorou o médico — o corpo protestou mais forte.',
      },
    ],
  },
  {
    id: 'delay_friend_favor',
    title: 'O amigo pediu o favor de volta',
    category: 'relationship',
    riskLevel: 'medium',
    requiresConsequence: 'helped_important_friend',
    description:
      'O amigo que você ajudou no passado apareceu com uma oportunidade — ou um pedido grande.',
    choices: [
      {
        id: 'help_back',
        label: 'Retribuir o favor',
        effects: { money: 180, reputation: 10, happiness: 8 },
        clearsConsequence: 'helped_important_friend',
        historyMessage: 'seu amigo abriu uma porta que mudou seu mês.',
      },
      {
        id: 'decline',
        label: 'Recusar agora',
        effects: { reputation: -6, happiness: -4 },
        clearsConsequence: 'helped_important_friend',
        memoryId: 'missed_opportunity',
        historyMessage: 'você recusou o retorno do favor e perdeu a chance.',
      },
    ],
  },
  {
    id: 'delay_risky_debt',
    title: 'A dívida arriscada venceu',
    category: 'money',
    riskLevel: 'extreme',
    requiresConsequence: 'risky_debt',
    description:
      'O empréstimo arriscado que você fez chegou na data. Juros, pressão e pouco tempo.',
    choices: [
      {
        id: 'pay_debt',
        label: 'Quitar com sacrifício',
        effects: { money: -300, stress: 12, happiness: -6 },
        clearsConsequence: 'risky_debt',
        historyMessage: 'você quitou a dívida arriscada sangrando o bolso.',
      },
      {
        id: 'renegotiate',
        label: 'Renegociar',
        effects: { money: -150, reputation: -8, stress: 18 },
        clearsConsequence: 'risky_debt',
        memoryId: 'suffocating_debt',
        historyMessage: 'a renegociação salvou o mês, mas não a dignidade.',
      },
    ],
  },
];
