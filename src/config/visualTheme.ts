import type { EventRiskLevel, EventCategory } from '../types/game';
import type { HistoryEntryType } from '../types/game';
import {
  Briefcase,
  Brain,
  DollarSign,
  Heart,
  Smile,
  Star,
  Zap,
  Sparkles,
  Activity,
  AlertTriangle,
  Trophy,
  Target,
  Building2,
  Home,
  Calendar,
  Skull,
  type LucideIcon,
} from 'lucide-react';

export interface StatTheme {
  key: string;
  label: string;
  icon: LucideIcon;
  iconClass: string;
  barClass: string;
  glowClass: string;
  tooltip: string;
  isMoney?: boolean;
  invertBar?: boolean;
  lowThreshold?: number;
  highThreshold?: number;
}

export const STAT_THEMES: StatTheme[] = [
  {
    key: 'money',
    label: 'Dinheiro',
    icon: DollarSign,
    iconClass: 'text-empire-gold',
    barClass: 'bg-gradient-to-r from-amber-600 to-empire-gold',
    glowClass: 'shadow-[0_0_12px_rgba(232,184,74,0.35)]',
    tooltip: 'Usado em ações, moradia, negócios e contas do mês.',
    isMoney: true,
  },
  {
    key: 'energy',
    label: 'Energia',
    icon: Zap,
    iconClass: 'text-yellow-400',
    barClass: 'bg-gradient-to-r from-yellow-600 to-yellow-300',
    glowClass: 'shadow-[0_0_10px_rgba(250,204,21,0.3)]',
    tooltip: 'Gasta em ações. Em 0 você desmaia.',
    lowThreshold: 25,
  },
  {
    key: 'physicalHealth',
    label: 'Saúde física',
    icon: Heart,
    iconClass: 'text-rose-400',
    barClass: 'bg-gradient-to-r from-rose-700 to-rose-400',
    glowClass: 'shadow-[0_0_10px_rgba(251,113,133,0.3)]',
    tooltip: 'Em 0 = morte. Cuide com descanso e treino.',
    lowThreshold: 25,
  },
  {
    key: 'mentalHealth',
    label: 'Saúde mental',
    icon: Brain,
    iconClass: 'text-violet-400',
    barClass: 'bg-gradient-to-r from-violet-700 to-violet-400',
    glowClass: 'shadow-[0_0_10px_rgba(167,139,250,0.3)]',
    tooltip: 'Em 0 = colapso mental.',
    lowThreshold: 25,
  },
  {
    key: 'happiness',
    label: 'Felicidade',
    icon: Smile,
    iconClass: 'text-pink-400',
    barClass: 'bg-gradient-to-r from-pink-700 to-pink-400',
    glowClass: '',
    tooltip: 'Socializar e equilíbrio aumentam; estresse reduz.',
    lowThreshold: 30,
  },
  {
    key: 'reputation',
    label: 'Reputação',
    icon: Star,
    iconClass: 'text-sky-400',
    barClass: 'bg-gradient-to-r from-sky-700 to-sky-400',
    glowClass: '',
    tooltip: 'Necessária para promoções de carreira.',
    lowThreshold: 25,
  },
  {
    key: 'stress',
    label: 'Estresse',
    icon: AlertTriangle,
    iconClass: 'text-orange-400',
    barClass: 'bg-gradient-to-r from-orange-700 to-orange-400',
    glowClass: 'shadow-[0_0_10px_rgba(251,146,60,0.35)]',
    tooltip: 'Em 100 dispara crise. Trabalho e estudo aumentam.',
    invertBar: true,
    highThreshold: 75,
  },
  {
    key: 'intelligence',
    label: 'Inteligência',
    icon: Sparkles,
    iconClass: 'text-cyan-400',
    barClass: 'bg-gradient-to-r from-cyan-700 to-cyan-400',
    glowClass: '',
    tooltip: 'Estudo e eventos aumentam. Ajuda em investimentos.',
  },
  {
    key: 'charisma',
    label: 'Carisma',
    icon: Activity,
    iconClass: 'text-emerald-400',
    barClass: 'bg-gradient-to-r from-emerald-700 to-emerald-400',
    glowClass: '',
    tooltip: 'Socializar melhora. Algumas carreiras exigem mais.',
  },
];

export const RISK_STYLES: Record<
  EventRiskLevel,
  { label: string; className: string; dotClass: string }
> = {
  low: {
    label: 'Baixo',
    className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    dotClass: 'bg-emerald-400',
  },
  medium: {
    label: 'Médio',
    className: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    dotClass: 'bg-sky-400',
  },
  high: {
    label: 'Alto',
    className: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    dotClass: 'bg-orange-400',
  },
  extreme: {
    label: 'Extremo',
    className: 'bg-red-500/20 text-red-300 border-red-500/40',
    dotClass: 'bg-red-400',
  },
};

export const EVENT_CATEGORY_META: Record<
  EventCategory,
  { label: string; icon: LucideIcon; color: string }
> = {
  work: { label: 'Trabalho', icon: Briefcase, color: 'text-sky-400' },
  health: { label: 'Saúde', icon: Heart, color: 'text-rose-400' },
  relationship: { label: 'Relacionamento', icon: Smile, color: 'text-pink-400' },
  money: { label: 'Dinheiro', icon: DollarSign, color: 'text-empire-gold' },
  morality: { label: 'Moralidade', icon: Star, color: 'text-violet-400' },
  studies: { label: 'Estudos', icon: Sparkles, color: 'text-cyan-400' },
  family: { label: 'Família', icon: Home, color: 'text-amber-300' },
  business: { label: 'Negócios', icon: Building2, color: 'text-emerald-400' },
  unexpected: { label: 'Imprevisto', icon: AlertTriangle, color: 'text-orange-400' },
};

export const HISTORY_TYPE_META: Record<
  HistoryEntryType,
  { label: string; icon: LucideIcon; borderClass: string; bgClass: string }
> = {
  action: {
    label: 'Ação',
    icon: Zap,
    borderClass: 'border-l-sky-500/60',
    bgClass: 'bg-sky-500/5',
  },
  event: {
    label: 'Evento',
    icon: Sparkles,
    borderClass: 'border-l-violet-500/60',
    bgClass: 'bg-violet-500/5',
  },
  achievement: {
    label: 'Conquista',
    icon: Trophy,
    borderClass: 'border-l-empire-gold/60',
    bgClass: 'bg-empire-gold/8',
  },
  objective: {
    label: 'Objetivo',
    icon: Target,
    borderClass: 'border-l-emerald-500/60',
    bgClass: 'bg-emerald-500/5',
  },
  crisis: {
    label: 'Crise',
    icon: Skull,
    borderClass: 'border-l-red-500/70',
    bgClass: 'bg-red-500/10',
  },
  business: {
    label: 'Negócio',
    icon: Building2,
    borderClass: 'border-l-emerald-500/50',
    bgClass: 'bg-emerald-500/5',
  },
  housing: {
    label: 'Moradia',
    icon: Home,
    borderClass: 'border-l-amber-500/50',
    bgClass: 'bg-amber-500/5',
  },
  career: {
    label: 'Carreira',
    icon: Briefcase,
    borderClass: 'border-l-indigo-500/50',
    bgClass: 'bg-indigo-500/5',
  },
  monthly: {
    label: 'Finanças',
    icon: Calendar,
    borderClass: 'border-l-slate-500/50',
    bgClass: 'bg-slate-500/5',
  },
  general: {
    label: 'Vida',
    icon: Calendar,
    borderClass: 'border-l-slate-600/40',
    bgClass: 'bg-slate-500/5',
  },
};
