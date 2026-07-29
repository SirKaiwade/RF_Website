import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabase, supabaseConfigured } from './supabase';

export const ALLOWED_EMAIL_DOMAIN = 'unu.edu';

export function isAllowedEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(`@${ALLOWED_EMAIL_DOMAIN}`);
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  provider: 'supabase';
}

function initialsFrom(name: string, email: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function toAuthUser(user: User): AuthUser | null {
  const email = (user.email ?? '').trim().toLowerCase();
  if (!email || !isAllowedEmail(email)) return null;
  const name =
    (user.user_metadata?.full_name as string | undefined)?.trim() ||
    (user.user_metadata?.name as string | undefined)?.trim() ||
    email.split('@')[0];
  return {
    id: user.id,
    name,
    email,
    initials: initialsFrom(name, email),
    provider: 'supabase',
  };
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  /** True when VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set. */
  supabaseReady: boolean;
  /**
   * Send a magic link to an @unu.edu address.
   * Does not set `user` until the link is opened (or an OTP verified).
   */
  sendMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function rejectDisallowedSession(session: Session | null): Promise<AuthUser | null> {
  if (!session?.user) return null;
  const next = toAuthUser(session.user);
  if (next) return next;

  // Domain check failed after a real auth session — kick them out.
  const sb = getSupabase();
  await sb?.auth.signOut();
  throw new Error(
    `Access is limited to @${ALLOWED_EMAIL_DOMAIN} accounts. Signed in as ${session.user.email ?? 'unknown'}.`
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const ready = supabaseConfigured();

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { data } = await sb.auth.getSession();
        if (cancelled) return;
        try {
          const next = await rejectDisallowedSession(data.session);
          setUser(next);
        } catch {
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_event, session) => {
      void (async () => {
        try {
          const next = await rejectDisallowedSession(session);
          if (!cancelled) setUser(next);
        } catch {
          if (!cancelled) setUser(null);
        }
      })();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const sendMagicLink = useCallback(async (email: string) => {
    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      throw new Error('Enter your UNU email address.');
    }
    if (!isAllowedEmail(normalized)) {
      throw new Error(
        `Access is limited to @${ALLOWED_EMAIL_DOMAIN} addresses. Use your institutional email.`
      );
    }

    const sb = getSupabase();
    if (!sb) {
      throw new Error(
        'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local (and Vercel).'
      );
    }

    const { error } = await sb.auth.signInWithOtp({
      email: normalized,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        shouldCreateUser: true,
      },
    });

    if (error) throw new Error(error.message);
  }, []);

  const signOut = useCallback(async () => {
    const sb = getSupabase();
    await sb?.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      supabaseReady: ready,
      sendMagicLink,
      signOut,
    }),
    [user, loading, ready, sendMagicLink, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
