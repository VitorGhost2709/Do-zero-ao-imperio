import { motion } from 'framer-motion';
import { ShoppingBag, Check } from 'lucide-react';
import { UPGRADES } from '../data/upgrades';
import { useGameStore } from '../store/gameStore';

export function UpgradeShop() {
  const stats = useGameStore((s) => s.stats);
  const purchasedUpgrades = useGameStore((s) => s.purchasedUpgrades);
  const purchaseUpgrade = useGameStore((s) => s.purchaseUpgrade);
  const gameOver = useGameStore((s) => s.gameOver);

  return (
    <section className="empire-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <ShoppingBag className="h-4 w-4 text-empire-gold" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Loja de upgrades
        </h2>
      </div>

      <div className="space-y-3">
        {UPGRADES.map((upgrade, i) => {
          const owned = purchasedUpgrades.includes(upgrade.id);
          const canBuy =
            !owned && !gameOver && stats.money >= upgrade.cost;

          return (
            <motion.div
              key={upgrade.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`rounded-xl border p-3 ${
                owned
                  ? 'border-empire-success/30 bg-empire-success/5'
                  : 'border-empire-border bg-empire-surface'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {upgrade.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {upgrade.description}
                  </p>
                  <p className="mt-1 text-xs font-medium text-empire-gold">
                    R$ {upgrade.cost.toLocaleString('pt-BR')}
                  </p>
                </div>
                {owned ? (
                  <span className="flex items-center gap-1 rounded-full bg-empire-success/20 px-2 py-1 text-[10px] text-empire-success">
                    <Check className="h-3 w-3" />
                    Comprado
                  </span>
                ) : (
                  <motion.button
                    type="button"
                    disabled={!canBuy}
                    onClick={() => purchaseUpgrade(upgrade.id)}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      canBuy
                        ? 'bg-empire-accent text-white hover:bg-empire-accent/80'
                        : 'cursor-not-allowed bg-empire-border text-slate-500'
                    }`}
                    whileHover={canBuy ? { scale: 1.05 } : {}}
                    whileTap={canBuy ? { scale: 0.95 } : {}}
                  >
                    Comprar
                  </motion.button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
