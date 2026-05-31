import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'gold' | 'success' | 'danger' | 'warning' | 'accent';
  className?: string;
}

const VARIANTS = {
  default: 'bg-empire-surface text-slate-300 border-empire-border',
  gold: 'bg-empire-gold/15 text-empire-gold border-empire-gold/30',
  success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  danger: 'bg-red-500/15 text-red-300 border-red-500/40',
  warning: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  accent: 'bg-empire-accent/15 text-indigo-300 border-empire-accent/30',
};

export function Badge({
  children,
  variant = 'default',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
