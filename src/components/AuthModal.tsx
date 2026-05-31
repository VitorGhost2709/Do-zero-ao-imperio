import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { isSupabaseConfigured } from '../lib/supabaseClient';

type AuthMode = 'login' | 'signup';

export function AuthModal() {
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const loading = useAuthStore((s) => s.loading);
  const authError = useAuthStore((s) => s.authError);
  const clearAuthError = useAuthStore((s) => s.clearAuthError);

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isSupabaseConfigured) {
    return (
      <div className="rounded-xl border border-empire-border/60 bg-empire-surface/50 p-4 text-sm text-slate-400">
        <p className="font-medium text-slate-300">Nuvem indisponível</p>
        <p className="mt-2 text-xs leading-relaxed">
          Configure <code className="text-empire-gold">VITE_SUPABASE_URL</code> e{' '}
          <code className="text-empire-gold">VITE_SUPABASE_ANON_KEY</code> para
          habilitar login e saves na nuvem. O jogo continua salvando localmente.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    clearAuthError();

    const result =
      mode === 'login'
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password);

    if (result.ok) {
      setFeedback(result.message ?? 'Bem-vindo!');
      setPassword('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 rounded-xl bg-empire-bg/80 p-1">
        {(['login', 'signup'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setFeedback(null);
              clearAuthError();
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-medium transition ${
              mode === m
                ? 'bg-empire-gold/20 text-empire-gold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {m === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-empire-border bg-empire-bg/80 px-3 py-2.5 text-sm text-white focus:border-empire-gold/50 focus:outline-none"
            placeholder="seu@email.com"
          />
        </label>
        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Senha
          </span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-empire-border bg-empire-bg/80 px-3 py-2.5 text-sm text-white focus:border-empire-gold/50 focus:outline-none"
            placeholder="Mínimo 6 caracteres"
          />
        </label>

        {(authError || feedback) && (
          <p
            className={`text-xs ${authError ? 'text-red-400' : 'text-emerald-400'}`}
          >
            {authError ?? feedback}
          </p>
        )}

        <motion.button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-empire-gold py-3 text-sm font-semibold text-empire-bg disabled:opacity-50"
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : mode === 'login' ? (
            <LogIn className="h-4 w-4" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          {mode === 'login' ? 'Entrar' : 'Criar conta'}
        </motion.button>
      </form>

      <p className="text-center text-[10px] text-slate-500">
        Jogue sem conta — seu progresso fica salvo neste dispositivo.
      </p>
    </div>
  );
}
