import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Skull,
  Brain,
  RotateCcw,
  Trophy,
  BookOpen,
  Award,
  Sun,
  Heart,
  Sparkles,
  Frown,
  Copy,
  Check,
} from 'lucide-react';
import { DIFFICULTY_MAP } from '../data/difficulties';
import { LIFE_PATH_MAP } from '../data/lifePaths';
import { ORIGIN_MAP } from '../data/origins';
import { TRAIT_MAP } from '../data/traits';
import { ACHIEVEMENT_MAP } from '../data/achievements';
import { useGameStore } from '../store/gameStore';
import { getCareer } from '../utils/careerLogic';
import { BUSINESS_MAP } from '../data/businesses';
import type { GameOverType } from '../types/game';
import {
  buildBiographyExportText,
  copyBiographyToClipboard,
} from '../utils/copyBiography';

function getGameOverTitle(
  type: GameOverType,
  patrimony: number,
  money: number,
): string {
  if (type === 'retirement') return 'Jornada Concluída';
  if (type === 'mental_collapse') return 'Uma Vida Interrompida';
  if (money > 500 && patrimony > 2000) return 'O Império Caiu';
  return 'Fim da Jornada';
}

export function GameOverScreen() {
  const gameOver = useGameStore((s) => s.gameOver);
  const resetGame = useGameStore((s) => s.resetGame);
  const [copied, setCopied] = useState(false);
  const [showManualCopy, setShowManualCopy] = useState(false);
  const [exportText, setExportText] = useState('');

  const ironicWealth =
    gameOver &&
    gameOver.finalPatrimony >= 1500 &&
    (gameOver.type === 'death' || gameOver.type === 'mental_collapse');

  const classificationLabel =
    gameOver?.lifeClassificationLabel ?? 'Trabalhador comum';

  const biography = gameOver?.biography ?? gameOver?.lifeSummary ?? '';
  const highlights = gameOver?.diaryHighlights ?? [];
  const positiveMemories = gameOver?.positiveMemories ?? [];
  const negativeMemories = gameOver?.negativeMemories ?? [];

  const relationsSummary = gameOver
    ? [
        gameOver.partnerName
          ? `Parceiro(a): ${gameOver.partnerName}`
          : gameOver.exPartnerName
            ? `Ex: ${gameOver.exPartnerName}`
            : 'Sem parceiro(a)',
        gameOver.hasChildren
          ? `${gameOver.childrenCount} filho(s)`
          : 'Sem filhos',
        `Relacionamento: ${gameOver.relationshipScore}/100`,
      ].join(' · ')
    : '';

  const retirementLabel = gameOver?.retirementMoodLabel;

  return (
    <AnimatePresence>
      {gameOver && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-empire-border/80 bg-gradient-to-b from-empire-card to-empire-bg p-6 sm:p-8"
            initial={{ scale: 0.9, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 22 }}
          >
            <div className="text-center">
              <div
                className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ring-1 ${
                  gameOver.type === 'retirement'
                    ? 'bg-empire-gold/15 ring-empire-gold/40'
                    : 'bg-red-500/15 ring-red-500/30'
                }`}
              >
                {gameOver.type === 'retirement' ? (
                  <Sun className="h-7 w-7 text-empire-gold" />
                ) : gameOver.type === 'death' ? (
                  <Skull className="h-7 w-7 text-red-400" />
                ) : (
                  <Brain className="h-7 w-7 text-violet-400" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-white">
                {getGameOverTitle(
                  gameOver.type,
                  gameOver.finalPatrimony,
                  gameOver.finalMoney,
                )}
              </h2>
              <p className="mt-1 text-lg text-empire-gold">{gameOver.characterName}</p>
              {retirementLabel && (
                <p className="mt-1 text-sm text-slate-400">{retirementLabel}</p>
              )}
            </div>

            <div className="mt-5 rounded-xl border border-empire-gold/40 bg-gradient-to-r from-empire-gold/15 to-transparent p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Award className="h-5 w-5 text-empire-gold" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Classificação da vida
                </p>
              </div>
              <p className="mt-2 text-xl font-bold text-empire-gold">
                {classificationLabel}
              </p>
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-xl border border-empire-gold/20 bg-empire-gold/5 p-3">
              <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-empire-gold" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Biografia
                </p>
                <p className="mt-1 break-words text-sm italic leading-relaxed text-slate-300">
                  {biography}
                </p>
              </div>
            </div>

            {highlights.length > 0 && (
              <div className="mt-4 rounded-xl border border-empire-border/60 bg-empire-surface/50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Linha do tempo
                </p>
                <ul className="mt-2 space-y-2">
                  {highlights.map((entry) => (
                    <li key={entry.id} className="flex gap-2 text-xs">
                      <span className="shrink-0 text-slate-500">
                        {entry.age}a
                      </span>
                      <span className="text-slate-300">
                        <span className="font-medium text-white">{entry.title}</span>
                        {entry.partnerName ? ` · ${entry.partnerName}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border border-empire-border/50 bg-empire-surface/40 p-3">
                <p className="flex items-center gap-1 text-[10px] font-semibold uppercase text-slate-500">
                  <Heart className="h-3 w-3 text-rose-400" />
                  Relações finais
                </p>
                <p className="mt-1 text-xs text-slate-300">{relationsSummary}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {gameOver.emotionalLegacy}
                </p>
              </div>
              <div className="rounded-xl border border-empire-border/50 bg-empire-surface/40 p-3">
                <p className="text-[10px] font-semibold uppercase text-slate-500">
                  Legado financeiro
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  {gameOver.financialLegacy}
                </p>
              </div>
            </div>

            {(positiveMemories.length > 0 || negativeMemories.length > 0) && (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {positiveMemories.length > 0 && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <p className="flex items-center gap-1 text-[10px] font-semibold uppercase text-emerald-400/90">
                      <Sparkles className="h-3 w-3" />
                      Melhores memórias
                    </p>
                    <ul className="mt-1.5 space-y-1">
                      {positiveMemories.slice(0, 4).map((m) => (
                        <li key={m} className="text-xs text-slate-300">
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {negativeMemories.length > 0 && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                    <p className="flex items-center gap-1 text-[10px] font-semibold uppercase text-red-400/90">
                      <Frown className="h-3 w-3" />
                      Piores memórias
                    </p>
                    <ul className="mt-1.5 space-y-1">
                      {negativeMemories.slice(0, 4).map((m) => (
                        <li key={m} className="text-xs text-slate-300">
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {ironicWealth && (
              <p className="mt-3 text-center text-xs text-amber-200/80">
                Construiu patrimônio, mas o corpo ou a mente não acompanharam o ritmo
                do império.
              </p>
            )}

            <p
              className={`mt-3 text-center text-[11px] uppercase tracking-wider ${
                gameOver.type === 'retirement'
                  ? 'text-empire-gold/90'
                  : 'text-red-400/90'
              }`}
            >
              {gameOver.cause}
            </p>

            <div className="mt-4 rounded-xl bg-empire-surface/80 p-3 text-xs text-slate-400">
              <p>
                {ORIGIN_MAP[gameOver.originId]?.name} · {TRAIT_MAP[gameOver.traitId]?.name}
              </p>
              <p className="mt-1">
                Dificuldade:{' '}
                {DIFFICULTY_MAP[gameOver.difficultyId ?? 'normal']?.name ?? 'Normal'}
              </p>
              <p className="mt-1">
                Caminho:{' '}
                {LIFE_PATH_MAP[gameOver.dominantLifePathId ?? 'balanced']?.name ??
                  'Vida Equilibrada'}
              </p>
              <p className="mt-1">
                Carreira: {getCareer(gameOver.finalCareerId).name}
              </p>
              {gameOver.ownedBusinessIds.length > 0 && (
                <p className="mt-1">
                  Negócios:{' '}
                  {gameOver.ownedBusinessIds
                    .map((id) => BUSINESS_MAP[id]?.name)
                    .join(', ')}
                </p>
              )}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: 'Idade', value: `${gameOver.finalAge} anos` },
                {
                  label: 'Dinheiro',
                  value: `R$ ${gameOver.finalMoney.toLocaleString('pt-BR')}`,
                },
                {
                  label: 'Patrimônio',
                  value: `R$ ${gameOver.finalPatrimony.toLocaleString('pt-BR')}`,
                },
                { label: 'Meses vividos', value: String(gameOver.monthsLived) },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-empire-border/60 bg-empire-bg/60 px-3 py-3 text-center"
                >
                  <p className="text-sm font-bold text-white">{stat.value}</p>
                  <p className="mt-0.5 text-[9px] uppercase text-slate-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {gameOver.unlockedAchievementIds.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  <Trophy className="h-3.5 w-3.5 text-empire-gold" />
                  Conquistas na jornada
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {gameOver.unlockedAchievementIds.map((id) => (
                    <span
                      key={id}
                      className="rounded-lg border border-empire-gold/25 bg-empire-gold/10 px-2 py-1 text-[10px] text-empire-gold"
                    >
                      {ACHIEVEMENT_MAP[id]?.title ?? id}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 space-y-2">
              <motion.button
                type="button"
                onClick={async () => {
                  if (!gameOver) return;
                  const text = buildBiographyExportText(gameOver);
                  setExportText(text);
                  const ok = await copyBiographyToClipboard(text);
                  if (ok) {
                    setCopied(true);
                    setShowManualCopy(false);
                    setTimeout(() => setCopied(false), 2500);
                  } else {
                    setShowManualCopy(true);
                  }
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-empire-border bg-empire-surface/80 py-3 text-sm font-medium text-slate-200 transition hover:bg-empire-surface"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-empire-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? 'Biografia copiada!' : 'Copiar biografia'}
              </motion.button>

              {showManualCopy && exportText && (
                <div className="rounded-xl border border-empire-border/60 bg-empire-bg/80 p-3">
                  <p className="mb-2 text-[10px] text-slate-500">
                    Selecione e copie manualmente:
                  </p>
                  <textarea
                    readOnly
                    value={exportText}
                    className="h-32 w-full resize-none rounded-lg border border-empire-border bg-empire-surface p-2 text-xs text-slate-300"
                    onFocus={(e) => e.target.select()}
                  />
                </div>
              )}

              <motion.button
                type="button"
                onClick={resetGame}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-empire-gold/40 bg-empire-gold/15 py-3.5 text-sm font-semibold text-empire-gold transition hover:bg-empire-gold/25"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <RotateCcw className="h-4 w-4" />
                Tentar outra vida
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
