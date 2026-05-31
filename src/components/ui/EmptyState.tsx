import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <Icon className="mb-2 h-8 w-8 text-slate-600" />
      <p className="text-sm text-slate-500">{title}</p>
      {description && (
        <p className="mt-1 max-w-xs text-xs text-slate-600">{description}</p>
      )}
    </div>
  );
}
