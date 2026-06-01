import type { ReactNode } from 'react';
import { User, Briefcase, Home, Building2, Heart, Eye } from 'lucide-react';
import { useCharacterSummaryData } from '../hooks/useCharacterSummaryData';

/** Versão estável para mobile — sem Framer Motion, blur, gradientes ou transform. */
export function MobileCharacterSummary() {
  const d = useCharacterSummaryData();

  return (
    <section className="mobile-safe-card w-full max-w-full p-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-empire-border bg-empire-surface">
          <User className="h-7 w-7 text-slate-300" aria-hidden />
        </div>
        <div className="w-full min-w-0">
          <h2 className="text-lg font-bold text-white">{d.characterName}</h2>
          <p className="mt-0.5 text-sm text-slate-400">
            {d.time.age} anos · {d.monthLabel}
          </p>
        </div>
        <div className="flex w-full min-w-0 flex-wrap justify-center gap-1.5">
          <Badge label={d.origin.name} className="text-empire-accent" />
          <Badge label={d.trait.name} className="text-empire-gold" />
          <Badge label={d.phase.label} className="text-slate-400" />
          <Badge label={d.difficulty.name} className="text-slate-400" />
          <Badge
            label={`${d.pathDef.name} (${d.pathPct}%)`}
            className="text-indigo-200"
          />
          {d.exhaustionCounter > 0 && (
            <Badge
              label={`Exaustão ${d.exhaustionCounter}/3`}
              className="text-orange-300"
            />
          )}
        </div>
      </div>

      <p className="mobile-safe-inner mt-4 px-3 py-3 text-sm italic leading-relaxed text-slate-300">
        &ldquo;{d.statusPhrase}&rdquo;
      </p>

      <div className="mt-3 space-y-2">
        <InfoRow
          icon={<Heart className="h-4 w-4 text-rose-400" />}
          text={`${d.relationshipLabel} · ${d.relationshipScore}/100${
            d.hasChildren && d.childrenCount > 0
              ? ` · ${d.childrenCount} filho(s)`
              : ''
          }`}
        />
        <InfoRow
          icon={<Eye className="h-4 w-4 text-violet-400" />}
          text={`Fama ${d.fame} · ${d.fameTier.label}`}
        />
        <div className="mobile-safe-inner p-3">
          <p className="text-xs leading-relaxed text-slate-400">
            {d.pathDef.description}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2">
        <MetricCard
          label="Dinheiro"
          value={`R$ ${d.stats.money.toLocaleString('pt-BR')}`}
          valueClass="text-emerald-300"
        />
        <MetricCard
          label="Patrimônio"
          value={`R$ ${d.patrimony.toLocaleString('pt-BR')}`}
          valueClass="text-white"
        />
        <MetricCard
          label="Trabalho"
          value={`R$ ${d.workIncome.toLocaleString('pt-BR')}`}
          valueClass="text-emerald-400"
        />
      </div>

      <div className="mt-3 space-y-2">
        <InfoRow
          icon={<Briefcase className="h-4 w-4 text-empire-accent" />}
          text={d.career.name}
        />
        <InfoRow
          icon={<Home className="h-4 w-4 text-empire-gold" />}
          text={d.housing.name}
        />
        <InfoRow
          icon={<Building2 className="h-4 w-4 text-emerald-400" />}
          text={
            d.ownedBusinessIds.length === 0
              ? 'Sem negócios'
              : `${d.ownedBusinessIds.length} negócio(s)`
          }
        />
      </div>

      {d.businessNames && (
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          {d.businessNames}
        </p>
      )}

      <div className="mt-3 space-y-2">
        {d.summaries.map(({ label, value }) => (
          <div key={label} className="mobile-safe-inner px-3 py-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              {label}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-300">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={`rounded-full border border-empire-border bg-empire-surface px-2 py-0.5 text-[11px] ${className}`}
    >
      {label}
    </span>
  );
}

function InfoRow({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="mobile-safe-inner flex min-w-0 items-start gap-2 p-3">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <p className="min-w-0 flex-1 break-words text-sm leading-relaxed text-slate-400">
        {text}
      </p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass: string;
}) {
  return (
    <div className="mobile-safe-inner min-w-0 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className={`mt-1 text-xl font-bold leading-tight ${valueClass}`}>{value}</p>
    </div>
  );
}
