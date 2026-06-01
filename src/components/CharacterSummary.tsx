import { User, Briefcase, Home, Building2, Heart, Eye } from 'lucide-react';
import { useIsMobile } from '../hooks/useMediaQuery';
import { useCharacterSummaryData } from '../hooks/useCharacterSummaryData';
import { MobileCharacterSummary } from './MobileCharacterSummary';

export function CharacterSummary() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileCharacterSummary />;
  }

  return <DesktopCharacterSummary />;
}

function DesktopCharacterSummary() {
  const d = useCharacterSummaryData();

  return (
    <section className="empire-card w-full max-w-full p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="mx-auto flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-empire-border bg-empire-surface sm:mx-0">
          <User className="h-8 w-8 text-slate-200" />
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h2 className="text-xl font-bold text-white">{d.characterName}</h2>
          <p className="text-sm text-slate-400">
            {d.time.age} anos · {d.monthLabel}
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
            <span className="rounded-full bg-empire-accent/20 px-2.5 py-0.5 text-[11px] text-empire-accent">
              {d.origin.name}
            </span>
            <span className="rounded-full bg-empire-gold/20 px-2.5 py-0.5 text-[11px] text-empire-gold">
              {d.trait.name}
            </span>
            <span className="rounded-full bg-empire-surface px-2.5 py-0.5 text-[11px] text-slate-400">
              {d.phase.label}
            </span>
            <span className="rounded-full border border-empire-border px-2.5 py-0.5 text-[11px] text-slate-400">
              {d.difficulty.name}
            </span>
            <span className="rounded-full border border-indigo-500/40 bg-indigo-500/15 px-2.5 py-0.5 text-[11px] text-indigo-200">
              {d.pathDef.name} ({d.pathPct}%)
            </span>
            {d.exhaustionCounter > 0 && (
              <span className="rounded-full bg-orange-500/20 px-2.5 py-0.5 text-[11px] text-orange-300">
                Exaustão {d.exhaustionCounter}/3
              </span>
            )}
          </div>
        </div>
      </div>

      <blockquote className="mt-4 rounded-xl border border-empire-border bg-empire-surface px-4 py-3 text-sm italic leading-relaxed text-slate-300">
        &ldquo;{d.statusPhrase}&rdquo;
      </blockquote>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div className="flex min-w-0 items-center gap-2 rounded-lg border border-empire-border bg-empire-surface px-3 py-2 text-xs">
          <Heart className="h-3.5 w-3.5 shrink-0 text-rose-400" />
          <span className="min-w-0 break-words text-slate-400">
            {d.relationshipLabel} · {d.relationshipScore}/100
            {d.hasChildren && d.childrenCount > 0
              ? ` · ${d.childrenCount} filho(s)`
              : ''}
          </span>
        </div>
        <div className="flex min-w-0 items-center gap-2 rounded-lg border border-empire-border bg-empire-surface px-3 py-2 text-xs">
          <Eye className="h-3.5 w-3.5 shrink-0 text-violet-400" />
          <span className="min-w-0 break-words text-slate-400">
            Fama {d.fame} · {d.fameTier.label}
          </span>
        </div>
        <div className="min-w-0 rounded-lg border border-empire-border bg-empire-surface px-3 py-2">
          <p className="text-xs leading-relaxed text-slate-400">
            {d.pathDef.description}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <MetricCard
          label="Dinheiro"
          value={`R$ ${d.stats.money.toLocaleString('pt-BR')}`}
          valueClass="text-empire-gold"
        />
        <MetricCard
          label="Patrimônio"
          value={`R$ ${d.patrimony.toLocaleString('pt-BR')}`}
          valueClass="text-white"
        />
        <MetricCard
          label="Trabalho"
          value={`R$ ${d.workIncome.toLocaleString('pt-BR')}`}
          valueClass="text-empire-success"
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
        <div className="flex min-w-0 items-center gap-2 rounded-lg border border-empire-border bg-empire-surface px-3 py-2 text-slate-400">
          <Briefcase className="h-3.5 w-3.5 shrink-0 text-empire-accent" />
          <span className="break-words">{d.career.name}</span>
        </div>
        <div className="flex min-w-0 items-center gap-2 rounded-lg border border-empire-border bg-empire-surface px-3 py-2 text-slate-400">
          <Home className="h-3.5 w-3.5 shrink-0 text-empire-gold" />
          <span className="break-words">{d.housing.name}</span>
        </div>
        <div className="flex min-w-0 items-center gap-2 rounded-lg border border-empire-border bg-empire-surface px-3 py-2 text-slate-400">
          <Building2 className="h-3.5 w-3.5 shrink-0 text-empire-success" />
          <span className="break-words">
            {d.ownedBusinessIds.length === 0
              ? 'Sem negócios'
              : `${d.ownedBusinessIds.length} negócio(s)`}
          </span>
        </div>
      </div>

      {d.businessNames && (
        <p className="mt-2 text-[10px] text-slate-600">{d.businessNames}</p>
      )}

      <div className="mt-3 space-y-1.5">
        {d.summaries.map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-col gap-0.5 rounded-lg border border-empire-border px-3 py-1.5 text-xs sm:flex-row sm:justify-between sm:gap-2"
          >
            <span className="shrink-0 text-slate-500">{label}</span>
            <span className="min-w-0 break-words text-slate-300 sm:text-right">
              {value}
            </span>
          </div>
        ))}
      </div>
    </section>
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
    <div className="min-w-0 rounded-xl border border-empire-border bg-empire-surface p-3 text-left">
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className={`mt-1 text-xl font-bold leading-tight ${valueClass}`}>{value}</p>
    </div>
  );
}
