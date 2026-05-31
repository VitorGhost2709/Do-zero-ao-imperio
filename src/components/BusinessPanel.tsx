import { motion } from 'framer-motion';
import { Building2, TrendingUp, ArrowUpCircle } from 'lucide-react';
import { BUSINESSES, BUSINESS_MAP } from '../data/businesses';
import { useGameStore } from '../store/gameStore';
import {
  canPurchaseBusiness,
  canUpgradeBusiness,
  getBusinessLevel,
  getBusinessMonthlyIncome,
  getBusinessProblemChance,
} from '../utils/businessLogic';
import { getMonthlyBusinessIncome } from '../utils/monthlyLogic';
import { Badge } from './ui/Badge';

export function BusinessPanel() {
  const stats = useGameStore((s) => s.stats);
  const ownedBusinessIds = useGameStore((s) => s.ownedBusinessIds);
  const businessLevels = useGameStore((s) => s.businessLevels);
  const purchaseBusiness = useGameStore((s) => s.purchaseBusiness);
  const upgradeBusiness = useGameStore((s) => s.upgradeBusiness);
  const gameOver = useGameStore((s) => s.gameOver);
  const activeEvent = useGameStore((s) => s.activeEvent);

  const passiveIncome = getMonthlyBusinessIncome(
    ownedBusinessIds,
    businessLevels,
  );
  const available = BUSINESSES.filter(
    (b) => !ownedBusinessIds.includes(b.id),
  );
  const disabled = !!gameOver || !!activeEvent;

  return (
    <section className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <Building2 className="h-4 w-4 text-empire-success" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Negócios
        </h2>
      </div>

      {ownedBusinessIds.length > 0 ? (
        <div className="mb-3 space-y-2">
          <div className="rounded-xl border border-empire-success/30 bg-empire-success/10 p-3">
            <p className="flex items-center gap-1 text-xs text-empire-success">
              <TrendingUp className="h-3.5 w-3.5" />
              Renda passiva líquida: R$ {passiveIncome}/mês
            </p>
          </div>
          {ownedBusinessIds.map((id) => {
            const b = BUSINESS_MAP[id];
            if (!b) return null;
            const level = getBusinessLevel(id, businessLevels);
            const income = getBusinessMonthlyIncome(id, businessLevels);
            const risk = Math.round(
              getBusinessProblemChance(id, businessLevels) * 100,
            );
            const upgrade = canUpgradeBusiness(
              stats,
              id,
              ownedBusinessIds,
              businessLevels,
            );

            return (
              <div
                key={id}
                className="rounded-lg border border-empire-border bg-empire-surface p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-white">{b.name}</p>
                  <Badge variant="gold">Nv. {level}/{b.maxLevel}</Badge>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  R$ {income}/mês · Risco ~{risk}%
                </p>
                {upgrade.ok && upgrade.cost !== undefined && (
                  <motion.button
                    type="button"
                    disabled={disabled}
                    onClick={() => upgradeBusiness(id)}
                    className="mt-2 flex items-center gap-1 rounded-lg bg-empire-gold/20 px-2.5 py-1.5 text-[11px] font-medium text-empire-gold disabled:opacity-40"
                    whileTap={{ scale: 0.97 }}
                  >
                    <ArrowUpCircle className="h-3 w-3" />
                    Evoluir (R$ {upgrade.cost.toLocaleString('pt-BR')})
                  </motion.button>
                )}
                {!upgrade.ok && level >= b.maxLevel && (
                  <p className="mt-1 text-[10px] text-emerald-400/80">
                    Nível máximo
                  </p>
                )}
                {!upgrade.ok && upgrade.reason && level < b.maxLevel && (
                  <p className="mt-1 text-[10px] text-slate-600">{upgrade.reason}</p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mb-3 text-xs text-slate-500">
          Nenhum negócio ainda. Invista para gerar renda passiva e mudar o jogo.
        </p>
      )}

      <div className="space-y-2">
        {available.map((biz, i) => {
          const check = canPurchaseBusiness(stats, biz.id, ownedBusinessIds);
          return (
            <motion.div
              key={biz.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-lg border border-empire-border bg-empire-surface p-3"
            >
              <p className="text-sm font-medium text-white">{biz.name}</p>
              <p className="mt-0.5 text-[11px] text-slate-500">{biz.description}</p>
              <p className="mt-1 text-[11px] text-empire-gold">
                R$ {biz.cost.toLocaleString('pt-BR')} · Nv.1: R${' '}
                {biz.incomeByLevel[0]}/mês
              </p>
              {!check.ok && (
                <p className="text-[10px] text-slate-600">{check.reason}</p>
              )}
              <button
                type="button"
                disabled={disabled || !check.ok}
                onClick={() => purchaseBusiness(biz.id)}
                className="mt-2 rounded-lg bg-empire-success/80 px-2.5 py-1 text-[11px] font-medium text-white disabled:opacity-40"
              >
                Comprar negócio
              </button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
