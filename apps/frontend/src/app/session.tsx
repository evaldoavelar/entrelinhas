import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ApiError } from '@entrelinhas/api-client';
import type { PreferencesUpdate, Session } from '@entrelinhas/contracts';
import { api } from '../api';

export type SessionState =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | { status: 'error'; error: ApiError }
  | { status: 'authenticated'; session: Session };

interface SessionContextValue {
  state: SessionState;
  reload: () => void;
  signedIn: (session: Session) => void;
  signOut: () => Promise<void>;
  updatePreferences: (update: PreferencesUpdate) => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const asApiError = (e: unknown) =>
  e instanceof ApiError ? e : new ApiError({ status: 0, code: 'unknown', message: 'Erro inesperado' });

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  // Every identity change (login, logout, reload) starts a new generation; async results from an
  // older generation are discarded so a late response can never overwrite a newer session.
  const generation = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    const started = generation.current;
    api.getSession({ signal: controller.signal }).then(
      (session) => {
        if (generation.current === started) setState({ status: 'authenticated', session });
      },
      (e: unknown) => {
        const error = asApiError(e);
        if (error.code === 'aborted' || generation.current !== started) return;
        setState(error.status === 401 ? { status: 'anonymous' } : { status: 'error', error });
      },
    );
    return () => controller.abort();
  }, [attempt]);

  // Theme is a per-profile preference (RF41); anonymous pages use the dark default.
  const theme = state.status === 'authenticated' ? state.session.preferences.theme : 'dark';
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const reload = useCallback(() => {
    generation.current += 1;
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  const signedIn = useCallback((session: Session) => {
    generation.current += 1;
    setState({ status: 'authenticated', session });
  }, []);

  const signOut = useCallback(async () => {
    await api.deleteSession();
    generation.current += 1;
    setState({ status: 'anonymous' });
  }, []);

  const updatePreferences = useCallback(async (update: PreferencesUpdate) => {
    const started = generation.current;
    const preferences = await api.updatePreferences(update);
    if (generation.current !== started) return;
    setState((current) => (current.status === 'authenticated' ? { status: 'authenticated', session: { ...current.session, preferences } } : current));
  }, []);

  const value = useMemo(() => ({ state, reload, signedIn, signOut, updatePreferences }), [state, reload, signedIn, signOut, updatePreferences]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession fora de SessionProvider');
  return value;
}
