import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import Animated, {
  FadeInDown,
  useReducedMotion,
} from 'react-native-reanimated';

import { colors } from '@/constants/colors';
import { useAuth } from '@/lib/auth/AuthProvider';

export default function AuthCallback() {
  const auth = useAuth();
  const reducedMotion = useReducedMotion();
  const { code, error, error_description } = useLocalSearchParams<{
    code?: string;
    error?: string;
    error_description?: string;
  }>();
  const hasOAuthError = Boolean(error || error_description);

  useEffect(() => {
    if (auth.status !== 'authenticated' && !auth.authError && !hasOAuthError)
      return undefined;
    const timer = setTimeout(
      () => router.replace('/'),
      auth.status === 'authenticated' ? (reducedMotion ? 120 : 720) : 1200,
    );
    return () => clearTimeout(timer);
  }, [auth.status, auth.authError, hasOAuthError, reducedMotion]);

  if (
    auth.status === 'unauthenticated' &&
    !auth.authError &&
    !code &&
    !hasOAuthError
  ) {
    return <Redirect href="/" />;
  }

  const authenticated = auth.status === 'authenticated';
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.cream,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 28,
      }}
    >
      <Animated.View
        entering={FadeInDown.duration(reducedMotion ? 120 : 360).springify()}
        style={{ alignItems: 'center' }}
      >
        <Text
          style={{
            color: colors.ink,
            fontSize: 34,
            fontWeight: '900',
            letterSpacing: 3,
            marginBottom: 23,
          }}
        >
          HEYTU
        </Text>
        {authenticated ? (
          <View
            style={{
              width: 62,
              height: 62,
              borderRadius: 31,
              backgroundColor: '#E8F5EF',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 17,
            }}
          >
            <Text
              style={{ color: colors.green, fontSize: 34, fontWeight: '900' }}
            >
              ✓
            </Text>
          </View>
        ) : null}
        <Text style={{ color: colors.ink, fontSize: 22, fontWeight: '900' }}>
          {authenticated ? '¡Bienvenido a HEYTU!' : 'Conectando con Google...'}
        </Text>
        {!authenticated && !auth.authError ? (
          <ActivityIndicator color={colors.blue} style={{ marginTop: 22 }} />
        ) : null}
        {auth.authError || hasOAuthError ? (
          <Text
            style={{
              color: colors.coral,
              textAlign: 'center',
              marginTop: 12,
              lineHeight: 20,
            }}
          >
            {auth.authError ??
              'No pudimos iniciar sesión. Inténtalo nuevamente.'}
          </Text>
        ) : null}
      </Animated.View>
    </View>
  );
}
