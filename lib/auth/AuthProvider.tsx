import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import type { Session, User } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

import { getOrCreateProfile, type HeytuProfile } from '@/lib/auth/profile';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

if (Platform.OS === 'web') WebBrowser.maybeCompleteAuthSession();

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
type AuthContextValue = {
  configured: boolean;
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  profile: HeytuProfile | null;
  authError: string | null;
  signInWithGoogle: () => Promise<'success' | 'cancelled' | 'error'>;
  signOut: () => Promise<boolean>;
  clearAuthError: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function presentableError(error: unknown): string {
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return /network|fetch|internet|offline/.test(message)
    ? 'No hay conexión. Revisa tu conexión e inténtalo nuevamente.'
    : 'Algo salió mal. Inténtalo nuevamente.';
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<HeytuProfile | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const activeUserId = useRef<string | null>(null);
  const loadedProfileUserId = useRef<string | null>(null);
  const requestedProfileUserId = useRef<string | null>(null);

  const hydrate = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);
    if (!nextSession?.user) {
      activeUserId.current = null;
      loadedProfileUserId.current = null;
      requestedProfileUserId.current = null;
      setProfile(null);
      setStatus('unauthenticated');
      return;
    }
    const userId = nextSession.user.id;
    if (activeUserId.current !== userId) setProfile(null);
    activeUserId.current = userId;
    if (loadedProfileUserId.current === userId) {
      setStatus('authenticated');
      return;
    }
    if (requestedProfileUserId.current === userId) return;
    requestedProfileUserId.current = userId;
    setStatus('loading');
    try {
      setProfile(await getOrCreateProfile(nextSession.user));
      loadedProfileUserId.current = userId;
    } catch (error) {
      if (__DEV__) console.error('Could not load HEYTU profile', error);
      setProfile(null);
      loadedProfileUserId.current = userId;
    } finally {
      if (requestedProfileUserId.current === userId)
        requestedProfileUserId.current = null;
      if (activeUserId.current === userId) setStatus('authenticated');
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setStatus('unauthenticated');
      return;
    }
    const client = supabase;
    let mounted = true;
    const { data: subscription } = client.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (mounted) void hydrate(nextSession);
      },
    );
    void client.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error && __DEV__)
        console.error('Could not restore auth session', error);
      void hydrate(data.session);
    });
    const appStateSubscription =
      Platform.OS === 'web'
        ? null
        : AppState.addEventListener('change', (state) => {
            if (state === 'active') void client.auth.startAutoRefresh();
            else void client.auth.stopAutoRefresh();
          });
    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
      appStateSubscription?.remove();
    };
  }, [hydrate]);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    if (!supabase) {
      setAuthError('La autenticación todavía no está configurada.');
      return 'error' as const;
    }
    try {
      const redirectTo =
        Platform.OS === 'web'
          ? window.location.origin
          : Linking.createURL('auth/callback');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          ...(Platform.OS === 'web' ? {} : { skipBrowserRedirect: true }),
          queryParams: { prompt: 'select_account' },
        },
      });
      if (error || !data.url) throw error ?? new Error('OAuth URL unavailable');
      if (Platform.OS === 'web') {
        window.location.assign(data.url);
        return 'success' as const;
      }
      let deepLinkUrl: string | null = null;
      const deepLinkSubscription =
        Platform.OS === 'android'
          ? Linking.addEventListener('url', ({ url }) => {
              deepLinkUrl = url;
              void WebBrowser.dismissBrowser().catch(() => undefined);
            })
          : null;
      let result: WebBrowser.WebBrowserAuthSessionResult;
      try {
        result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      } finally {
        deepLinkSubscription?.remove();
      }
      const callbackUrlText =
        result.type === 'success' ? result.url : deepLinkUrl;
      if (
        !callbackUrlText &&
        (result.type === 'cancel' || result.type === 'dismiss')
      ) {
        setAuthError('Inicio de sesión cancelado.');
        return 'cancelled' as const;
      }
      if (!callbackUrlText) throw new Error('OAuth was not completed');
      const callbackUrl = new URL(callbackUrlText);
      const code = callbackUrl.searchParams.get('code');
      const oauthError = callbackUrl.searchParams.get('error_description');
      if (oauthError) throw new Error(oauthError);
      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) throw exchangeError;
      }
      const { data: restored, error: restoreError } =
        await supabase.auth.getSession();
      if (restoreError || !restored.session) {
        throw restoreError ?? new Error('No authenticated session returned');
      }
      return 'success' as const;
    } catch (error) {
      if (__DEV__) console.error('Google sign-in failed', error);
      setAuthError(presentableError(error));
      return 'error' as const;
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return false;
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setAuthError(null);
      return true;
    } catch (error) {
      if (__DEV__) console.error('Sign-out failed', error);
      setAuthError(presentableError(error));
      return false;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return;
    try {
      setProfile(await getOrCreateProfile(session.user));
    } catch (error) {
      if (__DEV__) console.error('Could not refresh HEYTU profile', error);
      setAuthError(presentableError(error));
    }
  }, [session?.user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: isSupabaseConfigured,
      status,
      session,
      user: session?.user ?? null,
      profile,
      authError,
      signInWithGoogle,
      signOut,
      clearAuthError: () => setAuthError(null),
      refreshProfile,
    }),
    [
      status,
      session,
      profile,
      authError,
      signInWithGoogle,
      signOut,
      refreshProfile,
    ],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
