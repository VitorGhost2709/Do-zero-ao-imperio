import type { GameEvent } from '../types/game';
import { MORE_GENERAL_EVENTS } from './generalEventsV7';

const BASE_RANDOM_EVENTS: GameEvent[] = [
  {
    id: 'promotion',
    title: 'Seu chefe ofereceu uma promoção',
    category: 'work',
    description:
      'Uma vaga melhor surgiu na empresa. Mais responsabilidade, mais salário — e muito mais pressão.',
    choices: [
      {
        id: 'accept_promo',
        label: 'Aceitar a promoção',
        effects: { money: 150, reputation: 12, stress: 18, energy: -10, happiness: 5 },
        historyMessage: 'você aceitou a promoção e subiu de patamar na carreira.',
      },
      {
        id: 'decline_promo',
        label: 'Recusar por ora',
        effects: { mentalHealth: 8, happiness: 5, reputation: -3 },
        historyMessage: 'você recusou a promoção para preservar sua saúde.',
      },
      {
        id: 'negotiate_promo',
        label: 'Negociar condições',
        effects: { money: 80, reputation: 8, stress: 10, intelligence: 2 },
        historyMessage: 'você negociou uma promoção com condições mais humanas.',
      },
    ],
  },
  {
    id: 'overtime',
    title: 'Hora extra no trabalho',
    category: 'work',
    description:
      'Seu chefe ofereceu hora extra na semana. Mais renda, menos vida pessoal.',
    choices: [
      {
        id: 'accept',
        label: 'Aceitar',
        effects: { money: 120, reputation: 8, energy: -20, stress: 15, mentalHealth: -10 },
        historyMessage: 'você aceitou hora extra: mais dinheiro, muito cansaço.',
      },
      {
        id: 'refuse',
        label: 'Recusar',
        effects: { mentalHealth: 10, happiness: 8 },
        historyMessage: 'você recusou a hora extra e priorizou seu bem-estar.',
      },
      {
        id: 'negotiate',
        label: 'Negociar',
        effects: { money: 60, reputation: 4, energy: -10, stress: 8, mentalHealth: -4 },
        historyMessage: 'você negociou condições melhores para a hora extra.',
      },
    ],
  },
  {
    id: 'job_offer',
    title: 'Proposta de emprego',
    category: 'work',
    description: 'Uma empresa rival ofereceu um cargo melhor. Mudar é arriscado.',
    choices: [
      {
        id: 'accept_job',
        label: 'Aceitar o emprego',
        effects: { money: 200, reputation: 10, stress: 20, happiness: 5 },
        historyMessage: 'você mudou de emprego em busca de um futuro melhor.',
      },
      {
        id: 'stay',
        label: 'Ficar no emprego atual',
        effects: { reputation: 5, mentalHealth: 5 },
        historyMessage: 'você preferiu a estabilidade do emprego atual.',
      },
    ],
  },
  {
    id: 'sick',
    title: 'Você ficou doente',
    category: 'health',
    description:
      'Uma gripe forte te derrubou. Pode ignorar, ir ao médico ou descansar em casa.',
    choices: [
      {
        id: 'ignore_sick',
        label: 'Ignorar e trabalhar',
        effects: { physicalHealth: -20, mentalHealth: -8, money: 40, stress: 12 },
        historyMessage: 'você trabalhou doente e pagou um preço alto.',
      },
      {
        id: 'doctor_sick',
        label: 'Ir ao médico',
        effects: { money: -80, physicalHealth: 18, mentalHealth: 5, stress: -5 },
        historyMessage: 'você foi ao médico e se recuperou adequadamente.',
      },
      {
        id: 'rest_sick',
        label: 'Descansar em casa',
        effects: { physicalHealth: 12, energy: 15, money: -20, happiness: 3 },
        historyMessage: 'você descansou em casa até se recuperar.',
      },
    ],
  },
  {
    id: 'health_scare',
    title: 'Alerta de saúde',
    category: 'health',
    description: 'Dores incomuns apareceram. Ignorar, ir ao médico ou mudar hábitos?',
    choices: [
      {
        id: 'ignore',
        label: 'Ignorar',
        effects: { physicalHealth: -15, stress: 10 },
        historyMessage: 'você ignorou os sintomas e sua saúde piorou.',
      },
      {
        id: 'doctor',
        label: 'Ir ao médico',
        effects: { money: -100, physicalHealth: 15, mentalHealth: 5, stress: -5 },
        historyMessage: 'você foi ao médico e cuidou da sua saúde.',
      },
      {
        id: 'habits',
        label: 'Mudar hábitos',
        effects: { physicalHealth: 8, energy: -5, happiness: 3 },
        historyMessage: 'você adotou hábitos mais saudáveis.',
      },
    ],
  },
  {
    id: 'friend_loan',
    title: 'Um amigo pediu dinheiro emprestado',
    category: 'relationship',
    description:
      'Um amigo próximo pediu R$ 100 emprestados. Confiança ou prudência?',
    choices: [
      {
        id: 'lend_full',
        label: 'Emprestar o valor',
        effects: { money: -100, happiness: 8, reputation: 5, charisma: 3 },
        historyMessage: 'você emprestou dinheiro e fortaleceu a amizade.',
      },
      {
        id: 'lend_half',
        label: 'Emprestar metade',
        effects: { money: -50, happiness: 3, reputation: 2 },
        historyMessage: 'você emprestou metade do valor pedido.',
      },
      {
        id: 'refuse_loan',
        label: 'Recusar',
        effects: { reputation: -5, happiness: -5, mentalHealth: 3 },
        historyMessage: 'você recusou o empréstimo e preservou suas finanças.',
      },
    ],
  },
  {
    id: 'special_someone',
    title: 'Você conheceu alguém especial',
    category: 'relationship',
    description:
      'Uma pessoa incrível cruzou seu caminho. Investir no relacionamento ou focar na carreira?',
    choices: [
      {
        id: 'pursue',
        label: 'Investir no relacionamento',
        effects: { happiness: 20, charisma: 8, money: -60, energy: -10, stress: -8 },
        historyMessage: 'você investiu em um novo relacionamento especial.',
      },
      {
        id: 'casual',
        label: 'Levar com calma',
        effects: { happiness: 10, charisma: 4, stress: -3 },
        historyMessage: 'você conheceu alguém especial, sem pressa.',
      },
      {
        id: 'focus_career',
        label: 'Focar na carreira',
        effects: { money: 50, intelligence: 2, happiness: -8, stress: 5 },
        historyMessage: 'você priorizou a carreira em vez do romance.',
      },
    ],
  },
  {
    id: 'important_party',
    title: 'Você foi convidado para uma festa importante',
    category: 'relationship',
    description:
      'Um evento social de alto nível pode abrir portas — ou esvaziar sua conta.',
    choices: [
      {
        id: 'attend_glam',
        label: 'Ir bem vestido',
        effects: { happiness: 12, charisma: 10, reputation: 10, money: -90, energy: -12 },
        historyMessage: 'você brilhou na festa importante.',
      },
      {
        id: 'attend_simple',
        label: 'Ir de forma simples',
        effects: { happiness: 8, charisma: 4, reputation: 3, money: -30, energy: -8 },
        historyMessage: 'você foi à festa sem gastar muito.',
      },
      {
        id: 'skip_party',
        label: 'Não ir',
        effects: { reputation: -5, mentalHealth: 5, energy: 8 },
        historyMessage: 'você recusou o convite e ficou em casa.',
      },
    ],
  },
  {
    id: 'friend_party',
    title: 'Convite para festa',
    category: 'relationship',
    description: 'Um amigo te convidou para uma festa neste fim de semana.',
    choices: [
      {
        id: 'go',
        label: 'Ir à festa',
        effects: { happiness: 15, charisma: 8, money: -50, energy: -15, stress: -5 },
        historyMessage: 'você foi à festa e se divertiu muito.',
      },
      {
        id: 'skip',
        label: 'Ficar em casa',
        effects: { energy: 10, mentalHealth: 5, happiness: -3 },
        historyMessage: 'você ficou em casa descansando.',
      },
      {
        id: 'host',
        label: 'Organizar em casa',
        effects: { happiness: 10, charisma: 5, money: -80, reputation: 5 },
        historyMessage: 'você organizou um encontro em casa.',
      },
    ],
  },
  {
    id: 'expensive_course',
    title: 'Surgiu um curso caro, mas promissor',
    category: 'studies',
    description:
      'Um curso profissional pode acelerar sua carreira, mas custa R$ 200.',
    choices: [
      {
        id: 'enroll',
        label: 'Fazer o curso',
        effects: { money: -200, intelligence: 15, reputation: 8, stress: 10 },
        historyMessage: 'você investiu em um curso promissor.',
      },
      {
        id: 'free_alt',
        label: 'Buscar alternativa gratuita',
        effects: { intelligence: 6, energy: -8, happiness: 3 },
        historyMessage: 'você estudou por conta com materiais gratuitos.',
      },
      {
        id: 'skip_course',
        label: 'Não fazer agora',
        effects: { happiness: -2, mentalHealth: 2 },
        historyMessage: 'você adiou o curso para outro momento.',
      },
    ],
  },
  {
    id: 'study_scholarship',
    title: 'Bolsa de estudos disponível',
    category: 'studies',
    description: 'Uma instituição oferece bolsa parcial para quem se dedicar aos estudos.',
    choices: [
      {
        id: 'apply',
        label: 'Candidatar-se',
        effects: { intelligence: 10, money: 100, stress: 12, energy: -10 },
        historyMessage: 'você conquistou uma bolsa de estudos!',
      },
      {
        id: 'decline_scholarship',
        label: 'Não participar',
        effects: { happiness: 2 },
        historyMessage: 'você decidiu não se candidatar à bolsa.',
      },
    ],
  },
  {
    id: 'lucky_find',
    title: 'Dinheiro encontrado',
    category: 'money',
    description: 'Você encontrou uma carteira na rua. Devolver ou ficar com o dinheiro?',
    choices: [
      {
        id: 'return',
        label: 'Devolver',
        effects: { reputation: 15, happiness: 10 },
        historyMessage: 'você devolveu a carteira e ganhou respeito.',
      },
      {
        id: 'keep',
        label: 'Ficar com o dinheiro',
        effects: { money: 80, reputation: -10, happiness: -5 },
        historyMessage: 'você ficou com o dinheiro, mas a consciência pesou.',
      },
    ],
  },
  {
    id: 'scam_offer',
    title: 'Um investimento suspeito apareceu',
    category: 'money',
    description:
      'Alguém prometeu retorno garantido e alto. Parece bom demais para ser verdade...',
    choices: [
      {
        id: 'invest_all',
        label: 'Investir tudo',
        effects: { money: -150, stress: 25, mentalHealth: -15 },
        historyMessage: 'você caiu em um golpe e perdeu muito dinheiro.',
      },
      {
        id: 'small_bet',
        label: 'Investir pouco',
        effects: { money: -40, stress: 10 },
        historyMessage: 'você perdeu pouco no golpe, mas aprendeu a lição.',
      },
      {
        id: 'reject',
        label: 'Recusar',
        effects: { intelligence: 3, reputation: 3 },
        historyMessage: 'você recusou o golpe com sabedoria.',
      },
    ],
  },
  {
    id: 'business_opportunity',
    title: 'Oportunidade de negócio',
    category: 'business',
    description:
      'Um conhecido propôs um negócio paralelo. Entrar, ser sócio menor ou recusar?',
    choices: [
      {
        id: 'full_partner',
        label: 'Entrar como sócio',
        effects: { money: -120, reputation: 12, happiness: 8, stress: 15 },
        historyMessage: 'você entrou em um negócio paralelo arriscado.',
      },
      {
        id: 'small_invest',
        label: 'Investir pouco',
        effects: { money: -50, reputation: 5, stress: 8 },
        historyMessage: 'você investiu pouco no negócio paralelo.',
      },
      {
        id: 'decline_biz',
        label: 'Recusar',
        effects: { mentalHealth: 5, intelligence: 2 },
        historyMessage: 'você recusou o negócio e manteve o foco.',
      },
    ],
  },
  {
    id: 'family_help',
    title: 'Sua família precisa de ajuda',
    category: 'family',
    description:
      'Um parente passou por dificuldades e pediu apoio financeiro e emocional.',
    choices: [
      {
        id: 'help_full',
        label: 'Ajudar com tudo',
        effects: { money: -120, happiness: 10, reputation: 8, mentalHealth: 5 },
        historyMessage: 'você ajudou sua família em um momento difícil.',
      },
      {
        id: 'help_partial',
        label: 'Ajudar parcialmente',
        effects: { money: -50, happiness: 5, reputation: 3 },
        historyMessage: 'você ajudou sua família dentro do possível.',
      },
      {
        id: 'refuse_family',
        label: 'Não poder ajudar',
        effects: { happiness: -12, mentalHealth: -8, reputation: -5 },
        historyMessage: 'você não pôde ajudar a família e se sentiu mal.',
      },
    ],
  },
  {
    id: 'unethical_proposal',
    title: 'Você recebeu uma proposta antiética',
    category: 'morality',
    description:
      'Ofereceram dinheiro fácil por um atalho duvidoso no trabalho. Ética ou lucro?',
    choices: [
      {
        id: 'accept_unethical',
        label: 'Aceitar o atalho',
        effects: { money: 200, reputation: -20, happiness: -15, mentalHealth: -20, stress: 15 },
        historyMessage: 'você aceitou um atalho antiético e se arrependeu.',
      },
      {
        id: 'report',
        label: 'Denunciar',
        effects: { reputation: 15, happiness: 8, stress: 10, money: -20 },
        historyMessage: 'você denunciou a proposta antiética.',
      },
      {
        id: 'ignore_unethical',
        label: 'Ignorar',
        effects: { mentalHealth: 3, intelligence: 2 },
        historyMessage: 'você ignorou a proposta antiética.',
      },
    ],
  },
  {
    id: 'broken_computer',
    title: 'Seu computador quebrou',
    category: 'unexpected',
    description:
      'O notebook parou de funcionar. Consertar, comprar usado ou improvisar?',
    choices: [
      {
        id: 'repair',
        label: 'Consertar',
        effects: { money: -80, stress: 8, happiness: 3 },
        historyMessage: 'você consertou o computador e voltou a produzir.',
      },
      {
        id: 'buy_used',
        label: 'Comprar usado',
        effects: { money: -150, intelligence: 3, happiness: 5 },
        historyMessage: 'você comprou um notebook usado de substituição.',
      },
      {
        id: 'borrow',
        label: 'Pedir emprestado',
        effects: { stress: 12, intelligence: -2, happiness: -5, energy: -5 },
        historyMessage: 'você improvisou sem computador e sofreu no trabalho.',
      },
    ],
  },
  {
    id: 'unexpected_bill',
    title: 'Conta inesperada',
    category: 'unexpected',
    description: 'Chegou uma conta que você não esperava neste mês.',
    choices: [
      {
        id: 'pay_full',
        label: 'Pagar imediatamente',
        effects: { money: -90, stress: 8, reputation: 3 },
        historyMessage: 'você pagou a conta inesperada sem enrolar.',
      },
      {
        id: 'installments',
        label: 'Parcelar',
        effects: { money: -40, stress: 12, happiness: -3 },
        historyMessage: 'você parcelou a conta e aliviou o bolso.',
      },
      {
        id: 'delay',
        label: 'Adiar o pagamento',
        effects: { money: 0, reputation: -8, stress: 15, happiness: -8 },
        historyMessage: 'você adiou a conta e a situação piorou.',
      },
    ],
  },
];

export const RANDOM_EVENTS: GameEvent[] = [
  ...BASE_RANDOM_EVENTS,
  ...MORE_GENERAL_EVENTS,
];
