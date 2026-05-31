import { motion } from 'framer-motion';
import { Home, Key, ShoppingCart, Shield, Sofa, Star } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import {
  canPurchaseHousing,
  canRentHousing,
  getHousing,
  getPurchasableHousing,
  getRentableHousing,
  getOwnedHousingOptions,
} from '../utils/housingLogic';

function HousingAttributes({ housingId }: { housingId: string }) {
  const h = getHousing(housingId);
  return (
    <div className="mt-2 grid grid-cols-3 gap-1.5 text-[10px]">
      <span className="flex items-center gap-1 text-slate-500">
        <Sofa className="h-3 w-3" />
        Conforto {h.comfort}
      </span>
      <span className="flex items-center gap-1 text-slate-500">
        <Shield className="h-3 w-3" />
        Segurança {h.security}
      </span>
      <span className="flex items-center gap-1 text-slate-500">
        <Star className="h-3 w-3" />
        Status {h.socialStatus}
      </span>
    </div>
  );
}

export function HousingPanel() {
  const stats = useGameStore((s) => s.stats);
  const currentHousingId = useGameStore((s) => s.currentHousingId);
  const ownedHousingIds = useGameStore((s) => s.ownedHousingIds);
  const rentHousing = useGameStore((s) => s.rentHousing);
  const purchaseHousing = useGameStore((s) => s.purchaseHousing);
  const moveToHousing = useGameStore((s) => s.moveToHousing);
  const gameOver = useGameStore((s) => s.gameOver);

  const current = getHousing(currentHousingId);
  const rentable = getRentableHousing();
  const purchasable = getPurchasableHousing(ownedHousingIds);
  const owned = getOwnedHousingOptions(ownedHousingIds).filter(
    (h) => h.id !== currentHousingId,
  );

  return (
    <section className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <Home className="h-4 w-4 text-empire-gold" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Moradia
        </h2>
      </div>

      <div className="rounded-xl border border-empire-gold/30 bg-empire-gold/10 p-3">
        <p className="text-sm font-semibold text-white">{current.name}</p>
        <p className="mt-1 text-xs text-slate-400">{current.description}</p>
        <HousingAttributes housingId={currentHousingId} />
        <p className="mt-2 text-[11px] text-slate-500">
          {current.type === 'rent'
            ? `Aluguel: R$ ${current.monthlyRent}/mês`
            : current.monthlyMaintenance > 0
              ? `Manutenção: R$ ${current.monthlyMaintenance}/mês`
              : 'Sem custos de moradia'}
          {current.monthlyReputationBonus > 0 &&
            ` · +${current.monthlyReputationBonus} rep/mês`}
        </p>
      </div>

      {owned.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-[10px] uppercase text-slate-500">Seus imóveis</p>
          {owned.map((h) => (
            <button
              key={h.id}
              type="button"
              disabled={!!gameOver}
              onClick={() => moveToHousing(h.id)}
              className="w-full rounded-lg border border-empire-border bg-empire-surface px-3 py-2 text-left text-xs text-slate-300 hover:border-empire-gold/50 disabled:opacity-40"
            >
              Morar em {h.name}
            </button>
          ))}
        </div>
      )}

      {rentable
        .filter((h) => h.id !== currentHousingId)
        .map((h) => {
          const check = canRentHousing(stats, h.id);
          return (
            <motion.div
              key={h.id}
              className="mt-2 rounded-lg border border-empire-border bg-empire-surface p-3"
            >
              <p className="text-sm font-medium text-white">{h.name}</p>
              <HousingAttributes housingId={h.id} />
              <p className="text-[11px] text-slate-500">
                Aluguel R$ {h.monthlyRent}/mês
              </p>
              <button
                type="button"
                disabled={!!gameOver || !check.ok}
                onClick={() => rentHousing(h.id)}
                className="mt-2 flex items-center gap-1 rounded-lg bg-empire-gold/20 px-2.5 py-1 text-[11px] text-empire-gold disabled:opacity-40"
              >
                <Key className="h-3 w-3" />
                Alugar
              </button>
            </motion.div>
          );
        })}

      {purchasable.map((h) => {
        const check = canPurchaseHousing(stats, h.id, ownedHousingIds);
        return (
          <motion.div
            key={h.id}
            className="mt-2 rounded-lg border border-empire-border bg-empire-surface p-3"
          >
            <p className="text-sm font-medium text-white">{h.name}</p>
            <p className="text-[11px] text-slate-500">{h.description}</p>
            <HousingAttributes housingId={h.id} />
            <p className="text-[11px] text-empire-gold">
              R$ {h.purchaseCost.toLocaleString('pt-BR')}
            </p>
            <button
              type="button"
              disabled={!!gameOver || !check.ok}
              onClick={() => purchaseHousing(h.id)}
              className="mt-2 flex items-center gap-1 rounded-lg bg-empire-accent px-2.5 py-1 text-[11px] text-white disabled:opacity-40"
            >
              <ShoppingCart className="h-3 w-3" />
              Comprar
            </button>
          </motion.div>
        );
      })}
    </section>
  );
}
