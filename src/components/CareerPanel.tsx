import { motion } from 'framer-motion';
import { Briefcase, ArrowUpRight, Sparkles } from 'lucide-react';
import { Badge } from './ui/Badge';
import { useGameStore } from '../store/gameStore';
import {
  getCareer,
  getAvailableCareers,
  getMissingCareerRequirements,
  getUpcomingCareers,
} from '../utils/careerLogic';
import { calculateWorkIncome } from '../utils/gameLogic';

export function CareerPanel() {
  const stats = useGameStore((s) => s.stats);
  const currentCareerId = useGameStore((s) => s.currentCareerId);
  const traitId = useGameStore((s) => s.traitId);
  const difficultyId = useGameStore((s) => s.difficultyId);
  const purchasedUpgrades = useGameStore((s) => s.purchasedUpgrades);
  const changeCareer = useGameStore((s) => s.changeCareer);
  const gameOver = useGameStore((s) => s.gameOver);
  const activeEvent = useGameStore((s) => s.activeEvent);

  const current = getCareer(currentCareerId);
  const workPay = calculateWorkIncome(
    currentCareerId,
    purchasedUpgrades,
    stats,
    difficultyId,
  );
  const available = getAvailableCareers(stats, currentCareerId, traitId);
  const upcoming = getUpcomingCareers(currentCareerId).filter(
    (c) => !available.some((a) => a.id === c.id),
  );

  const disabled = !!gameOver || !!activeEvent;

  return (
    <section className="p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-empire-accent" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Carreira
          </h2>
        </div>
        {available.length > 0 && !disabled && (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Badge variant="accent" className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Promoção
            </Badge>
          </motion.div>
        )}
      </div>

      <div className="rounded-xl border border-empire-accent/30 bg-empire-accent/10 p-3">
        <p className="text-sm font-semibold text-white">{current.name}</p>
        <p className="mt-1 text-xs text-slate-400">{current.description}</p>
        {current.perkDescription && (
          <p className="mt-2 text-[10px] text-indigo-300/90">{current.perkDescription}</p>
        )}
        <p className="mt-2 text-xs text-empire-gold">
          Salário por trabalho: R$ {workPay}
        </p>
      </div>

      {available.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-[10px] uppercase tracking-wider text-empire-gold">
            Promoções disponíveis
          </p>
          <div className="space-y-2">
            {available.map((career, i) => (
              <motion.div
                key={career.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-lg border border-empire-accent/40 bg-empire-accent/5 p-3 ring-1 ring-empire-accent/20"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-white">{career.name}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      R$ {career.baseSalary}/base · Int {career.minIntelligence} · Car{' '}
                      {career.minCharisma} · Rep {career.minReputation}
                    </p>
                    {career.entryCost > 0 && (
                      <p className="text-[11px] text-empire-gold">
                        Custo: R$ {career.entryCost}
                      </p>
                    )}
                  </div>
                  <motion.button
                    type="button"
                    disabled={disabled}
                    onClick={() => changeCareer(career.id)}
                    className="flex shrink-0 items-center gap-1 rounded-lg bg-empire-accent px-2.5 py-1.5 text-[11px] font-medium text-white disabled:opacity-40"
                    whileTap={{ scale: 0.97 }}
                  >
                    <ArrowUpRight className="h-3 w-3" />
                    Promover
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-[10px] uppercase tracking-wider text-slate-500">
            Próximos passos
          </p>
          <div className="space-y-2">
            {upcoming.slice(0, 4).map((career) => {
              const missing = getMissingCareerRequirements(
                stats,
                career.id,
                traitId,
              );
              return (
                <div
                  key={career.id}
                  className="rounded-lg border border-empire-border/60 bg-empire-surface/50 px-3 py-2"
                >
                  <p className="text-xs font-medium text-slate-300">{career.name}</p>
                  {missing.length > 0 ? (
                    <ul className="mt-1 space-y-0.5">
                      {missing.map((m) => (
                        <li key={m.label} className="text-[10px] text-slate-500">
                          {m.label}: {m.current}/{m.required}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-0.5 text-[10px] text-emerald-400/80">
                      Requisitos atendidos — aguarde promoção.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
