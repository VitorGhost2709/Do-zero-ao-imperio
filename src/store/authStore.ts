import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { getAuthRedirectUrl } from '../utils/authRedirect';

interface AuthStore {
  session: Session | null;
  user: User | null;
  loading: boolean;
  authError: string | null;
  initialized: boolean;
  initialize: () => () => void;
  signUp: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
}

function friendlyAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) {
    return 'Email ou senha incorretos.';
  }
  if (message.includes('User already registered')) {
    return 'Este email já está cadastrado.';
  }
  if (message.includes('Password should be at least')) {
    return 'A senha deve ter pelo menos 6 caracteres.';
  }
  if (message.includes('Unable to validate email')) {
    return 'Email inválido.';
  }
  return message;
}

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  user: null,
  loading: isSupabaseConfigured,
  authError: null,
  initialized: false,

  initialize: () => {
    if (!isSupabaseConfigured || !supabase) {
      set({ loading: false, initialized: true });
      return () => {};
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      set({
        session: data.session,
        user: data.session?.user ?? null,
        loading: false,
        initialized: true,
      });
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
        loading: false,
        initialized: true,
      });
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  },

  signUp: async (email, password) => {
    if (!supabase) {
      return { ok: false, message: 'Supabase não configurado.' };
    }
    set({ loading: true, authError: null });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthRedirectUrl(),
      },
    });
    set({ loading: false });
    if (error) {
      const message = friendlyAuthError(error.message);
      set({ authError: message });
      return { ok: false, message };
    }
    if (data.session) {
      set({ session: data.session, user: data.user });
    }
    return {
      ok: true,
      message: data.session
        ? 'Conta criada com sucesso!'
        : 'Conta criada. Enviamos um email de confirmação. Depois de confirmar, volte para o jogo e faça login.',
    };
  },

  signIn: async (email, password) => {
    if (!supabase) {
      return { ok: false, message: 'Supabase não configurado.' };
    }
    set({ loading: true, authError: null });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    set({ loading: false });
    if (error) {
      const message = friendlyAuthError(error.message);
      set({ authError: message });
      return { ok: false, message };
    }
    set({ session: data.session, user: data.user });
    return { ok: true };
  },

  signOut: async () => {
    if (!supabase) return;
    set({ loading: true });
    await supabase.auth.signOut();
    set({ session: null, user: null, loading: false, authError: null });
  },

  clearAuthError: () => set({ authError: null }),
}));

export function getCurrentSession(): Session | null {
  return useAuthStore.getState().session;
}

export function getCurrentUser(): User | null {
  return useAuthStore.getState().user;
}
