import { CalendarDays } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import {
  getMonthlyBusinessIncome,
  getMonthlyExpensePreview,
} from '../utils/monthlyLogic';

export function MonthlySummary() {
  const stats = useGameStore((s) => s.stats);
  const currentHousingId = useGameStore((s) => s.currentHousingId);
  const ownedBusinessIds = useGameStore((s) => s.ownedBusinessIds);
  const businessLevels = useGameStore((s) => s.businessLevels);
  const difficultyId = useGameStore((s) => s.difficultyId);

  const expenses = getMonthlyExpensePreview(stats, currentHousingId, difficultyId);
  const income = getMonthlyBusinessIncome(ownedBusinessIds, businessLevels);
  const net = income - expenses;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-empire-border/80 bg-empire-surface/60 px-3 py-2">
      <CalendarDays className="h-4 w-4 shrink-0 text-slate-500" />
      <div className="flex flex-1 flex-wrap gap-x-4 gap-y-0.5 text-[11px]">
        <span className="text-slate-400">
          Contas/mês: <span className="text-red-300">-R$ {expenses}</span>
        </span>
        {income > 0 && (
          <span className="text-slate-400">
            Negócios: <span className="text-empire-success">+R$ {income}</span>
          </span>
        )}
        <span className="text-slate-400">
          Saldo previsto:{' '}
          <span className={net >= 0 ? 'text-empire-success' : 'text-red-300'}>
            {net >= 0 ? '+' : ''}R$ {net}
          </span>
        </span>
      </div>
    </div>
  );
}
