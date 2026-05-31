import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { DIFFICULTIES } from '../data/difficulties';
import { ORIGINS } from '../data/origins';
import { TRAITS } from '../data/traits';
import { useGameStore } from '../store/gameStore';
import type { DifficultyId, OriginId, TraitId } from '../types/game';
import { AuthButton } from './AuthButton';
import { GameLogo } from './GameLogo';

export function CharacterCreationScreen() {
  const createCharacter = useGameStore((s) => s.createCharacter);
  const [name, setName] = useState('');
  const [originId, setOriginId] = useState<OriginId>('middle_class');
  const [traitId, setTraitId] = useState<TraitId>('ambitious');
  const [difficultyId, setDifficultyId] = useState<DifficultyId>('normal');

  const selectedOrigin = ORIGINS.find((o) => o.id === originId)!;
  const selectedTrait = TRAITS.find((t) => t.id === traitId)!;

  const handleStart = () => {
    if (name.trim().length < 2) return;
    createCharacter(name.trim(), originId, traitId, difficultyId);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 py-10">
      <div className="absolute right-4 top-4 z-20">
        <AuthButton />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(232,184,74,0.12),transparent_55%)]" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-empire-bg to-transparent" />

      <motion.div
        className="relative z-10 w-full max-w-xl"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <header className="mb-8 text-center">
          <motion.div
            className="mx-auto mb-4"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ repeat: Infinity, duration: 4 }}
          >
            <GameLogo size="lg" className="mx-auto shadow-[0_0_40px_rgba(232,184,74,0.2)]" />
          </motion.div>
          <h1 className="empire-gradient-text text-3xl font-bold tracking-tight sm:text-4xl">
            Do Zero ao Império
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
            Construa sua vida mês a mês. Trabalhe, estude, cuide da saúde, crie
            relações, compre negócios e tente construir um império sem perder a
            si mesmo.
          </p>
          <p className="mx-auto mt-2 max-w-md text-xs text-slate-500">
            Você tem 18 anos. Escolha origem, traço e dificuldade — cada escolha
            molda sua história.
          </p>
        </header>

        <div className="empire-card-gold space-y-6 p-6 sm:p-8">
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Seu nome
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como o mundo vai te chamar?"
              maxLength={24}
              className="mt-2 w-full rounded-xl border border-empire-border bg-empire-bg/80 px-4 py-3.5 text-lg text-white placeholder:text-slate-600 focus:border-empire-gold/50 focus:outline-none focus:ring-1 focus:ring-empire-gold/30"
            />
          </label>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Origem social
            </span>
            <div className="mt-2 grid gap-2">
              {ORIGINS.map((origin) => (
                <button
                  key={origin.id}
                  type="button"
                  onClick={() => setOriginId(origin.id)}
                  className={`rounded-xl border p-3.5 text-left transition ${
                    originId === origin.id
                      ? 'border-empire-gold/50 bg-empire-gold/10 shadow-[inset_0_0_20px_rgba(232,184,74,0.06)]'
                      : 'border-empire-border/80 bg-empire-surface/50 hover:border-slate-500'
                  }`}
                >
                  <p className="font-medium text-white">{origin.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{origin.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Traço principal
            </span>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {TRAITS.map((trait) => (
                <button
                  key={trait.id}
                  type="button"
                  onClick={() => setTraitId(trait.id)}
                  className={`rounded-xl border p-3 text-left transition ${
                    traitId === trait.id
                      ? 'border-empire-gold/50 bg-empire-gold/10'
                      : 'border-empire-border/80 bg-empire-surface/50 hover:border-slate-500'
                  }`}
                >
                  <p className="text-sm font-medium text-white">{trait.name}</p>
                  <p className="mt-1 text-[10px] text-emerald-400">{trait.pros}</p>
                  <p className="text-[10px] text-red-400/90">{trait.cons}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Dificuldade
            </span>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDifficultyId(d.id)}
                  className={`rounded-xl border p-3 text-left transition ${
                    difficultyId === d.id
                      ? 'border-empire-gold/50 bg-empire-gold/10'
                      : 'border-empire-border/80 bg-empire-surface/50 hover:border-slate-500'
                  }`}
                >
                  <p className="text-sm font-medium text-white">{d.name}</p>
                  <p className="mt-1 text-[10px] text-slate-500">{d.description}</p>
                </button>
              ))}
            </div>
          </div>

          <motion.div
            layout
            className="rounded-xl border border-empire-gold/20 bg-gradient-to-r from-empire-gold/5 to-transparent p-4"
          >
            <div className="flex gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-empire-gold" />
              <div className="text-xs leading-relaxed text-slate-400">
                <p className="italic text-slate-300">{selectedOrigin.narrativePhrase}</p>
                <p className="mt-2">
                  <span className="text-emerald-400">+</span> {selectedTrait.pros}
                  <span className="mx-2 text-slate-600">·</span>
                  <span className="text-red-400/90">−</span> {selectedTrait.cons}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.button
            type="button"
            disabled={name.trim().length < 2}
            onClick={handleStart}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-empire-gold py-4 text-sm font-bold uppercase tracking-wide text-empire-bg shadow-[0_4px_24px_rgba(232,184,74,0.35)] disabled:opacity-40"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            Começar minha jornada
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
