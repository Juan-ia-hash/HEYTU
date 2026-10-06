import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useReducedMotion,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { useAuth } from '@/lib/auth/AuthProvider';
import { colors } from '@/constants/colors';
import { motionPresets } from '@/lib/motion';

export function AuthScreen({ onSuccess }: { onSuccess: () => void }) {
  const auth = useAuth();
  const reducedMotion = useReducedMotion();
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const scale = useSharedValue(1);
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    if (!success) return undefined;
    const timer = setTimeout(onSuccess, reducedMotion ? 160 : 720);
    return () => clearTimeout(timer);
  }, [success, onSuccess, reducedMotion]);

  const handleSignIn = async () => {
    if (pending) return;
    setPending(true);
    const result = await auth.signInWithGoogle();
    if (result === 'success' && auth.configured) setSuccess(true);
    setPending(false);
  };

  const entrance = (delay: number) =>
    FadeInDown.delay(reducedMotion ? 0 : delay)
      .duration(reducedMotion ? 120 : 380)
      .springify()
      .damping(20)
      .stiffness(150);

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 28,
        paddingVertical: 26,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Animated.View entering={entrance(0)} style={{ alignItems: 'center' }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 27,
            backgroundColor: colors.blue,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ rotate: '-5deg' }],
            elevation: 5,
          }}
        >
          <Text style={{ color: 'white', fontSize: 19, fontWeight: '900' }}>
            H
          </Text>
          <View
            style={{
              position: 'absolute',
              right: -5,
              top: -5,
              width: 19,
              height: 19,
              borderRadius: 10,
              backgroundColor: colors.yellow,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons
              name="star-four-points"
              size={11}
              color={colors.ink}
            />
          </View>
        </View>
        <Text
          style={{
            fontSize: 31,
            fontWeight: '900',
            letterSpacing: 2.8,
            color: colors.ink,
            marginTop: 17,
          }}
        >
          HEYTU
        </Text>
      </Animated.View>

      <Animated.View
        entering={entrance(100)}
        style={{ alignItems: 'center', marginTop: 45 }}
      >
        {success ? (
          <Animated.View
            entering={FadeInDown.duration(
              reducedMotion ? 100 : 260,
            ).springify()}
            style={{ alignItems: 'center' }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: '#E8F5EF',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 17,
              }}
            >
              <MaterialCommunityIcons
                name="check"
                size={32}
                color={colors.green}
              />
            </View>
            <Text
              style={{ fontSize: 26, fontWeight: '900', color: colors.ink }}
            >
              ¡Bienvenido a HEYTU!
            </Text>
          </Animated.View>
        ) : (
          <>
            <Text
              style={{
                fontSize: 26,
                lineHeight: 32,
                fontWeight: '900',
                color: colors.ink,
                textAlign: 'center',
              }}
            >
              ¡Bienvenido a HEYTU!
            </Text>
            <Text
              style={{
                color: colors.muted,
                textAlign: 'center',
                marginTop: 10,
                fontSize: 15,
                lineHeight: 23,
                maxWidth: 300,
              }}
            >
              Descubre algo que hacer con otras personas.
            </Text>
          </>
        )}
      </Animated.View>

      {!success && (
        <Animated.View
          entering={entrance(210)}
          style={{ width: '100%', marginTop: 38 }}
        >
          <Animated.View style={buttonStyle}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: pending }}
              disabled={pending}
              onPress={() => void handleSignIn()}
              onPressIn={() => {
                scale.set(withSpring(0.975, motionPresets.press));
              }}
              onPressOut={() => {
                scale.set(withSpring(1, motionPresets.press));
              }}
              style={{
                backgroundColor: colors.white,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: colors.line,
                minHeight: 57,
                paddingHorizontal: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 11,
                opacity: pending ? 0.72 : 1,
              }}
            >
              {pending ? (
                <ActivityIndicator size="small" color={colors.blue} />
              ) : (
                <MaterialCommunityIcons
                  name="google"
                  size={21}
                  color={colors.blue}
                />
              )}
              <Text
                style={{ color: colors.ink, fontWeight: '800', fontSize: 15 }}
              >
                {pending ? 'Conectando con Google...' : 'Continuar con Google'}
              </Text>
            </Pressable>
          </Animated.View>
          {auth.authError ? (
            <Text
              accessibilityRole="alert"
              style={{
                color: colors.coral,
                textAlign: 'center',
                marginTop: 15,
                lineHeight: 20,
              }}
            >
              {auth.authError}
            </Text>
          ) : null}
          {!auth.configured && !auth.authError ? (
            <Text
              style={{
                color: colors.muted,
                textAlign: 'center',
                marginTop: 15,
                lineHeight: 20,
              }}
            >
              La conexión de cuentas estará disponible cuando se configure
              HEYTU.
            </Text>
          ) : null}
          <Text
            style={{
              color: colors.muted,
              textAlign: 'center',
              marginTop: 25,
              fontSize: 12,
              lineHeight: 18,
            }}
          >
            Al continuar, iniciaremos sesión de forma segura con tu cuenta de
            Google.
          </Text>
        </Animated.View>
      )}
    </View>
  );
}
