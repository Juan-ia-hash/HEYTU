import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppImage } from '@/components/ui/AppImage';
import { AuthScreen } from '@/components/auth/AuthScreen';

import { achievements } from '@/data/achievements';
import {
  interests,
  interestLabels,
  interestColors,
  interestIcons,
  missionTypeMeta,
  preferences,
  preferenceLabels,
} from '@/data/catalog';
import { useHeytuState } from '@/hooks/useHeytuState';
import { useAuth } from '@/lib/auth/AuthProvider';
import {
  saveProfileDisplayName,
  saveProfilePreferences,
} from '@/lib/auth/profile';
import { selectionHaptic, successHaptic } from '@/lib/haptics';
import { recommendMissions, searchMissions } from '@/lib/recommendations';
import { colors } from '@/constants/colors';
import { layoutTransition, motionPresets, staggerEntrance } from '@/lib/motion';
import type {
  Interest,
  Mission,
  MissionType,
  Preference,
} from '@/types/domain';

type Page =
  | 'welcome'
  | 'interests'
  | 'preferences'
  | 'personalizing'
  | 'tutorial'
  | 'auth'
  | 'app';
type Tab = 'Explore' | 'Activity' | 'Profile';

function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const icon = (name: string, size = 22, color: string = colors.ink) => (
  <MaterialCommunityIcons name={name as never} size={size} color={color} />
);

function Action({
  label,
  onPress,
  tone = 'blue',
  disabled = false,
  small = false,
}: {
  label: string;
  onPress: () => void;
  tone?: 'blue' | 'ink' | 'white' | 'green' | 'violet';
  disabled?: boolean;
  small?: boolean;
}) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const bg = {
    blue: colors.blue,
    ink: colors.ink,
    white: colors.white,
    green: colors.green,
    violet: colors.violet,
  }[tone];
  return (
    <Animated.View style={style}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        onPressIn={() => {
          scale.set(withSpring(0.97, motionPresets.press));
        }}
        onPressOut={() => {
          scale.set(withSpring(1, motionPresets.press));
        }}
        style={{
          backgroundColor: bg,
          opacity: disabled ? 0.45 : 1,
          minHeight: small ? 42 : 54,
          paddingHorizontal: small ? 17 : 22,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
        }}
      >
        <Text
          style={{
            color: tone === 'white' ? colors.ink : 'white',
            fontSize: small ? 13 : 15,
            fontFamily: 'System',
            fontWeight: '800',
          }}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function Pill({
  label,
  selected,
  onPress,
  color = colors.blue,
  iconName,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
  iconName?: string;
}) {
  return (
    <Animated.View
      layout={layoutTransition}
      entering={FadeInDown.duration(220)}
    >
      <Pressable
        onPress={onPress}
        style={{
          backgroundColor: selected ? color : 'white',
          borderColor: selected ? color : '#EEE8DF',
          borderWidth: 1,
          borderRadius: 999,
          paddingVertical: 10,
          paddingHorizontal: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 7,
        }}
      >
        {iconName ? icon(iconName, 17, selected ? 'white' : color) : null}
        <Text
          style={{
            fontSize: 13,
            fontWeight: '700',
            color: selected ? 'white' : colors.ink,
          }}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function Heading({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}) {
  return (
    <View style={{ marginBottom: 20 }}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          {icon('arrow-left')}
        </Pressable>
      ) : null}
      <Text
        style={{
          fontSize: 31,
          fontWeight: '900',
          color: colors.ink,
          letterSpacing: -0.8,
        }}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={{
            fontSize: 15,
            color: colors.muted,
            marginTop: 7,
            lineHeight: 22,
          }}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

function Avatar({
  name,
  color = colors.violet,
  size = 36,
  uri,
}: {
  name: string;
  color?: string;
  size?: number;
  uri?: string | null;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'white',
      }}
    >
      {uri ? (
        <AppImage
          source={{ uri }}
          contentFit="cover"
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <Text
          style={{ color: 'white', fontWeight: '800', fontSize: size * 0.31 }}
        >
          {name.slice(0, 1).toUpperCase()}
        </Text>
      )}
    </View>
  );
}

function MissionCard({
  mission,
  onPress,
  wide = true,
  entranceIndex = 0,
  joined = false,
  memberName = 'You',
}: {
  mission: Mission;
  onPress: () => void;
  wide?: boolean;
  entranceIndex?: number;
  joined?: boolean;
  memberName?: string;
}) {
  const meta = missionTypeMeta[mission.type];
  const participants = joined
    ? [
        ...mission.participants,
        {
          id: 'you',
          name: memberName,
          initials: memberName.slice(0, 1),
          color: colors.coral,
        },
      ]
    : mission.participants;
  return (
    <Animated.View entering={staggerEntrance(entranceIndex)}>
      <Pressable
        onPress={() => {
          void selectionHaptic();
          onPress();
        }}
        style={{
          width: wide ? 268 : '100%',
          backgroundColor: 'white',
          borderRadius: 24,
          overflow: 'hidden',
          borderColor: '#F0ECE6',
          borderWidth: 1,
          marginRight: 14,
        }}
      >
        <View
          style={{
            height: 148,
            backgroundColor: interestColors[mission.category],
            position: 'relative',
          }}
        >
          <AppImage
            source={{ uri: mission.imageUrl }}
            contentFit="cover"
            style={{ position: 'absolute', width: '100%', height: '100%' }}
          />
          <View
            style={{
              flex: 1,
              backgroundColor: '#17233C24',
              padding: 14,
              justifyContent: 'space-between',
            }}
          >
            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: 'white',
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <Text
                style={{
                  color: meta.color,
                  fontSize: 10,
                  fontWeight: '900',
                  letterSpacing: 0.5,
                }}
              >
                {meta.label}
              </Text>
            </View>
            <View
              style={{
                alignSelf: 'flex-end',
                backgroundColor: colors.yellow,
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <Text
                style={{ color: colors.ink, fontSize: 11, fontWeight: '900' }}
              >
                ✦ {mission.points} HEYTU POINTS
              </Text>
            </View>
          </View>
        </View>
        <View style={{ padding: 16 }}>
          <Text
            numberOfLines={2}
            style={{
              color: colors.ink,
              fontWeight: '900',
              fontSize: 17,
              lineHeight: 22,
            }}
          >
            {mission.title}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              marginTop: 9,
            }}
          >
            {icon('map-marker-outline', 15, colors.muted)}
            <Text
              numberOfLines={1}
              style={{ color: colors.muted, fontSize: 12, flex: 1 }}
            >
              {mission.neighborhood} ·{' '}
              {mission.dayOffset === 0 ? 'Hoy' : `En ${mission.dayOffset} días`}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 14,
            }}
          >
            <View style={{ flexDirection: 'row' }}>
              {participants.slice(0, 3).map((p) => (
                <View key={p.id} style={{ marginRight: -7 }}>
                  <Avatar name={p.name} color={p.color} size={28} />
                </View>
              ))}
            </View>
            <Text
              style={{
                marginLeft: 13,
                fontSize: 11,
                color: colors.muted,
                fontWeight: '600',
              }}
            >
              {participants.length} participando ·{' '}
              {mission.maxParticipants - participants.length} lugares
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function Brand({ sub = 'DA EL PRIMER PASO' }: { sub?: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text
        style={{
          color: colors.ink,
          fontSize: 45,
          fontWeight: '900',
          letterSpacing: -2,
        }}
      >
        HEYTU
        <Text style={{ color: colors.coral }}>.</Text>
      </Text>
      <Text
        style={{
          fontSize: 10,
          letterSpacing: 2,
          color: colors.muted,
          fontWeight: '800',
          marginTop: -2,
        }}
      >
        {sub}
      </Text>
    </View>
  );
}

function OrbitingInterest({
  interest,
  index,
  progress,
}: {
  interest: Interest;
  index: number;
  progress: SharedValue<number>;
}) {
  const starts = [
    [-91, -62],
    [91, -62],
    [-71, 75],
    [71, 75],
  ];
  const [startX, startY] = starts[index % starts.length];
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: startX * (1 - progress.value) },
      { translateY: startY * (1 - progress.value) },
      { scale: 1 - interpolate(progress.value, [0, 0.72], [0, 0.45]) },
    ],
    opacity: interpolate(progress.value, [0, 0.48, 0.74], [1, 1, 0]),
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          zIndex: 2,
          width: 44,
          height: 44,
          borderRadius: 15,
          backgroundColor: interestColors[interest],
          alignItems: 'center',
          justifyContent: 'center',
          left: '50%',
          top: '50%',
          marginLeft: -22,
          marginTop: -22,
        },
        style,
      ]}
    >
      {icon(interestIcons[interest], 21, 'white')}
    </Animated.View>
  );
}

function PersonalizationHero({
  interests: selected,
}: {
  interests: Interest[];
}) {
  const progress = useSharedValue(0);
  const resolve = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.76, 0.92], [0, 1]),
    transform: [
      { translateY: interpolate(progress.value, [0.76, 0.92], [10, 0]) },
    ],
  }));
  const processing = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.52, 0.7], [1, 0]),
  }));
  const mascot = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.56, 0.78], [0, 1]),
    transform: [
      { scale: interpolate(progress.value, [0.56, 0.86], [0.72, 1]) },
    ],
  }));
  const sparkles = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.7, 0.82, 0.94, 1], [0, 1, 0.75, 0]),
    transform: [
      { scale: interpolate(progress.value, [0.7, 0.84, 1], [0.7, 1, 0.9]) },
    ],
  }));
  useEffect(() => {
    progress.set(withDelay(260, withSpring(1, motionPresets.success)));
    return () => progress.set(0);
  }, [progress]);
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.cream,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
      }}
    >
      <Animated.View
        entering={FadeIn.duration(350)}
        style={{ alignItems: 'center' }}
      >
        <View
          style={{
            width: 190,
            height: 190,
            borderRadius: 100,
            backgroundColor: '#EAF3FF',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {selected.slice(0, 4).map((interest, index) => (
            <OrbitingInterest
              key={interest}
              interest={interest}
              index={index}
              progress={progress}
            />
          ))}
          <Animated.View
            style={[
              {
                width: 92,
                height: 92,
                borderRadius: 48,
                backgroundColor: colors.blue,
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
              },
              mascot,
            ]}
          >
            <Text style={{ color: 'white', fontSize: 22, fontWeight: '900' }}>
              HEYTU
            </Text>
            <View
              style={{
                position: 'absolute',
                right: 3,
                top: 1,
                width: 29,
                height: 29,
                borderRadius: 16,
                backgroundColor: colors.coral,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon('heart', 14, 'white')}
            </View>
          </Animated.View>
          {[
            { top: 10, left: 83 },
            { top: 83, left: 158 },
            { top: 158, left: 83 },
            { top: 83, left: 10 },
          ].map((position, index) => (
            <Animated.Text
              key={index}
              style={[
                {
                  position: 'absolute',
                  ...position,
                  pointerEvents: 'none',
                  zIndex: 3,
                  color: index % 2 === 0 ? colors.yellow : colors.coral,
                  fontSize: index % 2 === 0 ? 19 : 15,
                  fontWeight: '900',
                },
                sparkles,
              ]}
            >
              ✦
            </Animated.Text>
          ))}
        </View>
        <Animated.Text
          style={[
            processing,
            { color: colors.muted, fontSize: 14, marginTop: 34 },
          ]}
        >
          Conociendo tus gustos...
        </Animated.Text>
        <Animated.View
          style={[resolve, { alignItems: 'center', marginTop: 34 }]}
        >
          <Text style={{ fontSize: 28, fontWeight: '900', color: colors.ink }}>
            ¡Listo!
          </Text>
          <Text style={{ color: colors.muted, fontSize: 15, marginTop: 8 }}>
            Encontré cosas para ti.
          </Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

export default function Home() {
  const auth = useAuth();
  const accountId = auth.user?.id ?? null;
  const state = useHeytuState(
    accountId,
    auth.status === 'authenticated' && !auth.profile?.onboarding_complete,
  );
  const localUser = state.user;
  const stateHydrated = state.hydrated;
  const restoreProfilePreferences = state.restoreProfilePreferences;
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState<Page>('welcome');
  const [tab, setTab] = useState<Tab>('Explore');
  const [detail, setDetail] = useState<Mission | null>(null);
  const [category, setCategory] = useState<Interest | null>(null);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [nameDraft, setNameDraft] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([]);
  const [selectedPreferencias, setSelectedPreferencias] = useState<
    Preference[]
  >([]);
  const [slide, setSlide] = useState(0);
  const [creatingType, setCreatingType] = useState<MissionType>('experience');
  const [formTitle, setFormTitle] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (
      auth.status !== 'authenticated' ||
      !stateHydrated ||
      !auth.profile ||
      !auth.user
    )
      return;
    if (auth.profile.onboarding_complete && !localUser.onboardingComplete) {
      restoreProfilePreferences(
        auth.profile.display_name,
        auth.profile.interests,
        auth.profile.preferences,
      );
      return;
    }
    if (localUser.onboardingComplete) {
      void saveProfilePreferences(auth.user.id, {
        interests: localUser.interests,
        preferences: localUser.preferences,
        onboarding_complete: true,
      }).catch((error: unknown) => {
        if (__DEV__)
          console.error('Could not sync HEYTU profile preferences', error);
      });
    }
  }, [
    auth.status,
    auth.profile,
    auth.user,
    stateHydrated,
    localUser.onboardingComplete,
    localUser.interests,
    localUser.preferences,
    restoreProfilePreferences,
  ]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 2300);
    return () => clearTimeout(timer);
  }, [toast]);

  const recommended = useMemo(
    () =>
      recommendMissions(
        state.missions.filter(
          (mission) => !state.user.joinedMissionIds.includes(mission.id),
        ),
        state.user,
      ),
    [state.missions, state.user],
  );
  const availableMissions = useMemo(
    () =>
      state.missions.filter(
        (mission) => !state.user.joinedMissionIds.includes(mission.id),
      ),
    [state.missions, state.user.joinedMissionIds],
  );
  const allSearch = useMemo(
    () =>
      query.trim()
        ? searchMissions(availableMissions, query)
        : availableMissions,
    [availableMissions, query],
  );
  const joined = useMemo(
    () =>
      state.user.joinedMissionIds
        .map((id) => state.missions.find((m) => m.id === id))
        .filter((m): m is Mission => Boolean(m)),
    [state.missions, state.user.joinedMissionIds],
  );
  const challenges = joined.filter((m) => m.type === 'challenge');
  const experiences = joined.filter((m) => m.type === 'experience');
  const detailDays = detail ? (state.user.challengeDays[detail.id] ?? []) : [];
  const detailProgress = detail
    ? (state.user.challengeProgress[detail.id] ?? {
        streak: 0,
        lastCompletion: null,
      })
    : { streak: 0, lastCompletion: null };
  const detailChallengeJoined = Boolean(
    detail?.type === 'challenge' &&
    state.user.joinedMissionIds.includes(detail.id),
  );
  const detailParticipants = useMemo(() => {
    if (!detail) return [];
    if (!state.user.joinedMissionIds.includes(detail.id))
      return detail.participants;
    return [
      ...detail.participants,
      {
        id: 'you',
        name: state.user.name || 'Tú',
        initials: (state.user.name || 'Y').slice(0, 1),
        color: colors.coral,
      },
    ];
  }, [detail, state.user.joinedMissionIds, state.user.name]);
  const visible = category
    ? availableMissions.filter((m) => m.category === category)
    : recommended;

  const toggleInterest = (value: Interest) => {
    void selectionHaptic();
    setSelectedInterests((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value],
    );
  };
  const togglePreference = (value: Preference) => {
    void selectionHaptic();
    setSelectedPreferencias((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value],
    );
  };
  const openMission = (m: Mission) => {
    setDetail(m);
    setSearching(false);
    setCategory(null);
  };
  const closeDetail = () => setDetail(null);
  const join = (m: Mission) => {
    if (state.user.joinedMissionIds.includes(m.id)) {
      setDetail(null);
      setTab('Activity');
      return;
    }
    state.joinMission(m);
    void successHaptic();
    setToast(
      m.type === 'volunteer'
        ? '¡Ya estás dentro! Hagamos algo bueno ✨'
        : '¡Ya estás dentro! Empieza una nueva historia ✨',
    );
    setDetail(null);
    setTab('Activity');
  };

  if (
    !state.hydrated ||
    auth.status === 'loading' ||
    (auth.profile?.onboarding_complete && !state.user.onboardingComplete)
  )
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.cream,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Brand sub="ENCUENTRA A TU GENTE" />
      </View>
    );

  const currentPage: Page =
    state.hydrated &&
    state.user.onboardingComplete &&
    !state.user.tutorialComplete &&
    page !== 'personalizing' &&
    page !== 'app'
      ? 'tutorial'
      : state.hydrated &&
          state.user.onboardingComplete &&
          state.user.tutorialComplete &&
          page === 'welcome'
        ? 'app'
        : page;
  const protectedPage =
    currentPage === 'app' && auth.status === 'unauthenticated'
      ? 'auth'
      : currentPage;
  const pageContent = (
    <>
      {protectedPage === 'auth' && (
        <AuthScreen
          onSuccess={() => {
            setPage('app');
            setTab('Explore');
          }}
        />
      )}
      {protectedPage === 'welcome' && (
        <View
          style={{
            flex: 1,
            justifyContent: 'space-between',
            paddingHorizontal: 27,
            paddingVertical: 30,
          }}
        >
          <View style={{ alignItems: 'center', marginTop: 35 }}>
            <Brand sub="DA EL PRIMER PASO" />
            <View
              style={{
                width: 236,
                height: 236,
                marginTop: 46,
                borderRadius: 118,
                backgroundColor: '#EAF3FF',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  width: 158,
                  height: 158,
                  backgroundColor: colors.blue,
                  borderRadius: 80,
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: [{ rotate: '-8deg' }],
                }}
              >
                <View style={{ flexDirection: 'row', gap: 28, marginTop: 12 }}>
                  <View
                    style={{
                      width: 13,
                      height: 17,
                      borderRadius: 10,
                      backgroundColor: 'white',
                    }}
                  />
                  <View
                    style={{
                      width: 13,
                      height: 17,
                      borderRadius: 10,
                      backgroundColor: 'white',
                    }}
                  />
                </View>
                <View
                  style={{
                    width: 42,
                    height: 20,
                    borderBottomWidth: 4,
                    borderColor: 'white',
                    borderRadius: 22,
                    marginTop: 9,
                  }}
                />
              </View>
              <View
                style={{
                  position: 'absolute',
                  right: 7,
                  top: 18,
                  width: 47,
                  height: 47,
                  borderRadius: 24,
                  backgroundColor: colors.yellow,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {icon('star-four-points', 20, colors.ink)}
              </View>
              <View
                style={{
                  position: 'absolute',
                  left: 9,
                  bottom: 24,
                  width: 40,
                  height: 40,
                  borderRadius: 22,
                  backgroundColor: colors.coral,
                }}
              />
            </View>
            <Text
              style={{
                fontSize: 32,
                lineHeight: 39,
                textAlign: 'center',
                color: colors.ink,
                fontWeight: '900',
                marginTop: 35,
              }}
            >
              Tu próxima persona favorita{'\n'}está por conocer.
            </Text>
            <Text
              style={{
                color: colors.muted,
                textAlign: 'center',
                marginTop: 10,
                fontSize: 15,
                lineHeight: 23,
              }}
            >
              Encuentra pequeñas aventuras y gente genial{'\n'}cerca de ti.
            </Text>
          </View>
          <View style={{ gap: 14 }}>
            <Action
              label="ENCUENTRA A TU GENTE"
              onPress={() => setPage('interests')}
            />
            <Text
              style={{ textAlign: 'center', color: colors.muted, fontSize: 12 }}
            >
              Personas reales. Intereses en común. Grandes historias.
            </Text>
          </View>
        </View>
      )}
      {protectedPage === 'interests' && (
        <View
          style={{
            flex: 1,
            paddingHorizontal: 22,
            paddingTop: 18,
            paddingBottom: 26,
          }}
        >
          <Heading
            title="¿Qué te gusta?"
            subtitle="Elige algunos intereses y encontraremos planes para ti."
            onBack={() => setPage('welcome')}
          />
          <ScrollView
            contentContainerStyle={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 10,
              paddingBottom: 22,
            }}
          >
            {interests.map((item) => (
              <Pill
                key={item}
                label={interestLabels[item]}
                iconName={interestIcons[item]}
                selected={selectedInterests.includes(item)}
                color={interestColors[item]}
                onPress={() => toggleInterest(item)}
              />
            ))}
          </ScrollView>
          <Action
            label={`SIGUIENTE · ${selectedInterests.length} SELECCIONADOS`}
            disabled={selectedInterests.length < 2}
            onPress={() => setPage('preferences')}
          />
        </View>
      )}
      {protectedPage === 'preferences' && (
        <View
          style={{
            flex: 1,
            paddingHorizontal: 22,
            paddingTop: 18,
            paddingBottom: 25,
          }}
        >
          <Heading
            title="¿Qué planes te gustan?"
            subtitle="Elige los planes a los que te gustaría sumarte."
            onBack={() => setPage('interests')}
          />
          <TextInput
            value={nameDraft}
            onChangeText={setNameDraft}
            placeholder="¿Cómo te llamas?"
            placeholderTextColor="#98A0AE"
            style={{
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 15,
              color: colors.ink,
              fontWeight: '700',
              marginBottom: 12,
            }}
          />
          <View style={{ gap: 12, flex: 1 }}>
            {preferences.map((item, i) => (
              <Pressable
                key={item}
                onPress={() => togglePreference(item)}
                style={{
                  minHeight: 61,
                  paddingHorizontal: 16,
                  backgroundColor: selectedPreferencias.includes(item)
                    ? '#EAF3FF'
                    : 'white',
                  borderRadius: 19,
                  borderWidth: 1,
                  borderColor: selectedPreferencias.includes(item)
                    ? colors.blue
                    : colors.line,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <Text style={{ fontSize: 22 }}>
                    {['🫶', '🧠', '🎈', '🎨', '🌱', '💚'][i]}
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '700',
                      color: colors.ink,
                    }}
                  >
                    {preferenceLabels[item]}
                  </Text>
                </View>
                {selectedPreferencias.includes(item) ? (
                  icon('check-circle', 21, colors.blue)
                ) : (
                  <View
                    style={{
                      width: 19,
                      height: 19,
                      borderWidth: 1.5,
                      borderColor: '#D9D5D0',
                      borderRadius: 10,
                    }}
                  />
                )}
              </Pressable>
            ))}
          </View>
          <Action
            label="Crear mi HEYTU"
            onPress={() => {
              state.finishOnboarding(
                nameDraft,
                selectedInterests,
                selectedPreferencias,
              );
              void selectionHaptic();
              setPage('personalizing');
              setTimeout(() => setPage('tutorial'), 1800);
            }}
          />
        </View>
      )}
      {protectedPage === 'personalizing' && (
        <PersonalizationHero interests={selectedInterests} />
      )}
      {protectedPage === 'tutorial' && (
        <View
          style={{
            flex: 1,
            paddingHorizontal: 26,
            paddingVertical: 26,
            justifyContent: 'space-between',
          }}
        >
          <View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Brand sub="UNA GUÍA RÁPIDA" />
              <Pressable
                onPress={() => {
                  state.finishTutorial();
                  setPage('app');
                }}
              >
                <Text style={{ color: colors.muted, fontWeight: '700' }}>
                  Omitir
                </Text>
              </Pressable>
            </View>
            <View style={{ alignItems: 'center', marginTop: 62 }}>
              <View
                style={{
                  width: 210,
                  height: 210,
                  borderRadius: 108,
                  backgroundColor: ['#EAF3FF', '#FFF0E4', '#F0ECFF'][slide],
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 86 }}>
                  {['🧭', '👋', '✨'][slide]}
                </Text>
              </View>
              <Text
                style={{
                  color: colors.blue,
                  fontSize: 12,
                  fontWeight: '900',
                  letterSpacing: 1.6,
                  marginTop: 34,
                }}
              >
                0{slide + 1} / 03
              </Text>
              <Text
                style={{
                  color: colors.ink,
                  fontSize: 29,
                  lineHeight: 35,
                  fontWeight: '900',
                  textAlign: 'center',
                  marginTop: 10,
                }}
              >
                {
                  [
                    'Encuentra un plan que vaya contigo.',
                    'Anímate. Saluda.',
                    'Suma historias, no solo puntos.',
                  ][slide]
                }
              </Text>
              <Text
                style={{
                  color: colors.muted,
                  textAlign: 'center',
                  lineHeight: 22,
                  fontSize: 15,
                  marginTop: 11,
                }}
              >
                {
                  [
                    'Explora aventuras locales según tus intereses.',
                    'Únete a personas con ganas de conocer gente nueva.',
                    'Cada pequeño sí llena tu vida de nuevas experiencias.',
                  ][slide]
                }
              </Text>
              <View style={{ flexDirection: 'row', gap: 7, marginTop: 24 }}>
                {[0, 1, 2].map((i) => (
                  <View
                    key={i}
                    style={{
                      width: i === slide ? 22 : 7,
                      height: 7,
                      borderRadius: 8,
                      backgroundColor: i === slide ? colors.blue : '#D9D5D0',
                    }}
                  />
                ))}
              </View>
            </View>
          </View>
          <Action
            label={slide === 2 ? 'EXPLORAR HEYTU' : 'SIGUIENTE'}
            onPress={() => {
              if (slide < 2) setSlide(slide + 1);
              else {
                state.finishTutorial();
                setPage('app');
              }
            }}
          />
        </View>
      )}
    </>
  );

  const searchScreen = searching && !detail;
  const appScreen = protectedPage === 'app';
  const topInset = insets.top;
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.cream,
        paddingTop: appScreen ? topInset : Math.max(topInset, 16),
      }}
    >
      {!appScreen ? (
        pageContent
      ) : (
        <>
          {detail ? (
            <View style={{ flex: 1 }}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 34 }}
              >
                <View
                  style={{
                    height: 300,
                    backgroundColor: interestColors[detail.category],
                    position: 'relative',
                  }}
                >
                  <AppImage
                    source={{ uri: detail.imageUrl }}
                    contentFit="cover"
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                    }}
                  />
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: '#17233C24',
                      padding: 20,
                      justifyContent: 'space-between',
                    }}
                  >
                    <Pressable
                      onPress={closeDetail}
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 15,
                        backgroundColor: 'white',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {icon('arrow-left')}
                    </Pressable>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Pill
                        label={missionTypeMeta[detail.type].label}
                        color={missionTypeMeta[detail.type].color}
                        selected
                      />
                      <Pill
                        label={`${detail.points} HEYTU POINTS`}
                        color={colors.yellow}
                        selected
                      />
                    </View>
                  </View>
                </View>
                <View style={{ padding: 22 }}>
                  <Text
                    style={{
                      color: missionTypeMeta[detail.type].color,
                      fontSize: 11,
                      fontWeight: '900',
                      letterSpacing: 1.2,
                    }}
                  >
                    {interestLabels[detail.category].toUpperCase()} ·{' '}
                    {detail.durationMinutes} MIN
                  </Text>
                  <Text
                    style={{
                      color: colors.ink,
                      fontSize: 29,
                      fontWeight: '900',
                      lineHeight: 34,
                      marginTop: 8,
                    }}
                  >
                    {detail.title}
                  </Text>
                  <Text
                    style={{
                      color: colors.muted,
                      lineHeight: 23,
                      fontSize: 15,
                      marginTop: 12,
                    }}
                  >
                    {detail.description}
                  </Text>
                  <View
                    style={{ flexDirection: 'row', gap: 13, marginTop: 22 }}
                  >
                    <View
                      style={{
                        backgroundColor: 'white',
                        padding: 14,
                        borderRadius: 17,
                        flex: 1,
                      }}
                    >
                      {icon('map-marker-outline', 20, colors.blue)}
                      <Text
                        style={{
                          color: colors.ink,
                          fontWeight: '800',
                          marginTop: 8,
                        }}
                      >
                        {detail.neighborhood}
                      </Text>
                      <Text style={{ color: colors.muted, fontSize: 12 }}>
                        {detail.location}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: 'white',
                        padding: 14,
                        borderRadius: 17,
                        flex: 1,
                      }}
                    >
                      {icon('calendar-blank-outline', 20, colors.coral)}
                      <Text
                        style={{
                          color: colors.ink,
                          fontWeight: '800',
                          marginTop: 8,
                        }}
                      >
                        {detail.dayOffset === 0
                          ? 'Hoy'
                          : `En ${detail.dayOffset} días`}
                      </Text>
                      <Text style={{ color: colors.muted, fontSize: 12 }}>
                        {detail.time} · {detail.durationMinutes} min
                      </Text>
                    </View>
                  </View>
                  <View style={{ marginTop: 24 }}>
                    <Text
                      style={{
                        fontSize: 17,
                        color: colors.ink,
                        fontWeight: '900',
                      }}
                    >
                      Tu grupo
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 13,
                      }}
                    >
                      {detailParticipants.slice(0, 5).map((p) => (
                        <View key={p.id} style={{ marginRight: -5 }}>
                          <Avatar name={p.name} color={p.color} size={38} />
                        </View>
                      ))}
                      <Text
                        style={{
                          marginLeft: 14,
                          color: colors.muted,
                          fontSize: 12,
                          fontWeight: '700',
                        }}
                      >
                        {detailParticipants.length} personas participarán
                      </Text>
                    </View>
                  </View>
                  {detail.type === 'challenge' && detailChallengeJoined && (
                    <View
                      style={{
                        marginTop: 26,
                        padding: 18,
                        backgroundColor: 'white',
                        borderRadius: 21,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.ink,
                          fontSize: 18,
                          fontWeight: '900',
                        }}
                      >
                        TU PROGRESO
                      </Text>
                      <Text
                        style={{
                          color: colors.violet,
                          fontSize: 17,
                          fontWeight: '900',
                          marginTop: 9,
                        }}
                      >
                        {detailDays.length} / {detail.challengeDays ?? 21} días
                      </Text>
                      <View
                        style={{
                          height: 8,
                          backgroundColor: '#F0ECFF',
                          borderRadius: 8,
                          marginTop: 9,
                          overflow: 'hidden',
                        }}
                      >
                        <View
                          style={{
                            width: `${Math.min(100, (detailDays.length / (detail.challengeDays ?? 21)) * 100)}%`,
                            height: 8,
                            backgroundColor: colors.violet,
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          color: colors.violet,
                          fontWeight: '900',
                          marginTop: 17,
                        }}
                      >
                        🔥 RACHA ACTUAL · {detailProgress.streak} días
                      </Text>
                      <Text
                        style={{
                          color: colors.ink,
                          fontWeight: '800',
                          marginTop: 16,
                        }}
                      >
                        HOY
                      </Text>
                      <Text style={{ color: colors.muted, marginTop: 4 }}>
                        {detail.description}
                      </Text>
                      <Text
                        style={{
                          color: colors.ink,
                          fontWeight: '900',
                          marginTop: 19,
                        }}
                      >
                        DÍAS COMPLETADOS
                      </Text>
                      <Text style={{ color: colors.muted, marginTop: 7 }}>
                        {detailDays.length
                          ? detailDays
                              .map((day) => `✓ Día ${day}`)
                              .join('  ·  ')
                          : 'Aún no hay días completados.'}
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>
              <View
                style={{
                  paddingHorizontal: 20,
                  paddingTop: 12,
                  paddingBottom: Math.max(insets.bottom, 14),
                  backgroundColor: colors.cream,
                  borderTopWidth: 1,
                  borderColor: colors.line,
                }}
              >
                <Action
                  label={
                    detail.type === 'challenge' && detailChallengeJoined
                      ? detailDays.length >= (detail.challengeDays ?? 21)
                        ? 'DESAFÍO COMPLETADO ✨'
                        : detailProgress.lastCompletion === localDateKey()
                          ? 'HOY COMPLETADO ✓'
                          : 'REGÍSTRATE HOY · +20 HEYTU POINTS'
                      : state.user.joinedMissionIds.includes(detail.id)
                        ? 'YA ESTÁS DENTRO'
                        : missionTypeMeta[detail.type].action
                  }
                  disabled={
                    detail.type === 'challenge' &&
                    detailChallengeJoined &&
                    (detailDays.length >= (detail.challengeDays ?? 21) ||
                      detailProgress.lastCompletion === localDateKey())
                  }
                  tone={
                    detail.type === 'volunteer'
                      ? 'green'
                      : detail.type === 'challenge'
                        ? 'violet'
                        : 'blue'
                  }
                  onPress={() => {
                    if (detail.type === 'challenge' && detailChallengeJoined) {
                      if (state.completeChallengeDay(detail)) {
                        void successHaptic();
                        setToast('¡Día registrado! +20 HEYTU Points ✨');
                      }
                    } else if (
                      state.user.joinedMissionIds.includes(detail.id)
                    ) {
                      if (detail.type === 'experience') {
                        state.completeMission(detail);
                        void successHaptic();
                        setToast(`+${detail.points} HEYTU Points · ¡Muy bien!`);
                        setDetail(null);
                      }
                    } else join(detail);
                  }}
                />
              </View>
            </View>
          ) : searchScreen ? (
            <View style={{ flex: 1 }}>
              <View
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <Pressable
                  onPress={() => {
                    setSearching(false);
                    setQuery('');
                  }}
                >
                  {icon('arrow-left', 24)}
                </Pressable>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: 'white',
                    borderRadius: 17,
                    paddingHorizontal: 13,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  {icon('magnify', 20, colors.muted)}
                  <TextInput
                    autoFocus
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Prueba café, esta noche, Miraflores…"
                    placeholderTextColor="#98A0AE"
                    style={{
                      padding: 14,
                      flex: 1,
                      color: colors.ink,
                      fontSize: 14,
                    }}
                  />
                </View>
              </View>
              <FlatList
                data={allSearch}
                keyExtractor={(mission) => mission.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 20,
                  paddingBottom: 30,
                  flexGrow: 1,
                }}
                ListHeaderComponent={
                  <Text
                    style={{
                      fontSize: 22,
                      color: colors.ink,
                      fontWeight: '900',
                      marginVertical: 10,
                    }}
                  >
                    {query
                      ? `${allSearch.length} planes para explorar`
                      : 'Explorar todos los planes'}
                  </Text>
                }
                renderItem={({ item, index }) => (
                  <View style={{ marginBottom: 12 }}>
                    <MissionCard
                      mission={item}
                      wide={false}
                      entranceIndex={index}
                      joined={state.user.joinedMissionIds.includes(item.id)}
                      memberName={state.user.name || 'Tú'}
                      onPress={() => openMission(item)}
                    />
                  </View>
                )}
                ListEmptyComponent={
                  <View style={{ alignItems: 'center', padding: 40 }}>
                    <Text style={{ fontSize: 42 }}>🧐</Text>
                    <Text
                      style={{
                        color: colors.ink,
                        fontSize: 19,
                        fontWeight: '900',
                        marginTop: 12,
                      }}
                    >
                      Todavía no hay planes
                    </Text>
                    <Text
                      style={{
                        color: colors.muted,
                        textAlign: 'center',
                        marginTop: 7,
                      }}
                    >
                      Prueba con otro interés, lugar o día.
                    </Text>
                  </View>
                }
              />
            </View>
          ) : (
            <>
              {tab === 'Explore' && !category && (
                <View style={{ flex: 1 }}>
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 30 }}
                  >
                    <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Brand sub="TU BARRIO, TU GENTE" />
                        <Pressable onPress={() => setTab('Profile')}>
                          <Avatar
                            name={state.user.name || 'H'}
                            color={colors.coral}
                            size={42}
                          />
                        </Pressable>
                      </View>
                      <Text
                        style={{
                          marginTop: 26,
                          color: colors.ink,
                          fontWeight: '900',
                          fontSize: 27,
                          lineHeight: 32,
                        }}
                      >
                        Hola, {state.user.name || '¿qué plan va más contigo?'},
                        {'\n'}
                      </Text>
                      <Pressable
                        onPress={() => setSearching(true)}
                        style={{
                          backgroundColor: 'white',
                          borderRadius: 17,
                          paddingHorizontal: 14,
                          height: 51,
                          marginTop: 16,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 10,
                        }}
                      >
                        {icon('magnify', 22, colors.muted)}
                        <Text style={{ color: '#98A0AE', fontSize: 14 }}>
                          Buscar planes, personas, lugares…
                        </Text>
                      </Pressable>
                      <View
                        style={{
                          backgroundColor: colors.blue,
                          borderRadius: 25,
                          padding: 18,
                          marginTop: 21,
                          overflow: 'hidden',
                        }}
                      >
                        <View
                          style={{
                            position: 'absolute',
                            right: -25,
                            top: -30,
                            width: 135,
                            height: 135,
                            borderRadius: 70,
                            backgroundColor: '#FFFFFF18',
                          }}
                        />
                        <Text
                          style={{
                            color: '#DCEAFF',
                            fontWeight: '900',
                            fontSize: 10,
                            letterSpacing: 1,
                          }}
                        >
                          UN PEQUEÑO SÍ PUEDE LLEGAR LEJOS
                        </Text>
                        <Text
                          style={{
                            color: 'white',
                            fontSize: 21,
                            fontWeight: '900',
                            lineHeight: 26,
                            marginTop: 8,
                            maxWidth: '77%',
                          }}
                        >
                          Las cosas buenas pasan cuando te animas.
                        </Text>
                        <Pressable
                          onPress={() => setCreateOpen(true)}
                          style={{
                            alignSelf: 'flex-start',
                            marginTop: 14,
                            backgroundColor: colors.yellow,
                            borderRadius: 13,
                            paddingHorizontal: 13,
                            paddingVertical: 9,
                          }}
                        >
                          <Text
                            style={{
                              color: colors.ink,
                              fontSize: 12,
                              fontWeight: '900',
                            }}
                          >
                            CREAR UN PLAN ↗
                          </Text>
                        </Pressable>
                      </View>
                      <View style={{ marginTop: 24 }}>
                        <Text
                          style={{
                            color: colors.ink,
                            fontSize: 18,
                            fontWeight: '900',
                            marginBottom: 12,
                          }}
                        >
                          Encuentra lo que te gusta
                        </Text>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={{ gap: 9, paddingRight: 20 }}
                        >
                          {interests.map((x) => (
                            <Pressable
                              key={x}
                              onPress={() => {
                                setCategory(x);
                                setSearching(false);
                              }}
                              style={{
                                paddingVertical: 10,
                                paddingHorizontal: 13,
                                borderRadius: 999,
                                backgroundColor: 'white',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 7,
                              }}
                            >
                              <View
                                style={{
                                  width: 22,
                                  height: 22,
                                  borderRadius: 11,
                                  backgroundColor: `${interestColors[x]}20`,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                {icon(interestIcons[x], 13, interestColors[x])}
                              </View>
                              <Text
                                style={{
                                  fontWeight: '700',
                                  color: colors.ink,
                                  fontSize: 12,
                                }}
                              >
                                {interestLabels[x]}
                              </Text>
                            </Pressable>
                          ))}
                        </ScrollView>
                      </View>
                      {[
                        ['Para ti', recommended.slice(0, 9)],
                        [
                          'Cerca de ti',
                          [...state.missions]
                            .sort((a, b) => a.dayOffset - b.dayOffset)
                            .slice(0, 8),
                        ],
                        [
                          'Buenas acciones',
                          state.missions
                            .filter((m) => m.type === 'volunteer')
                            .slice(0, 8),
                        ],
                        [
                          'Desafíos diarios',
                          state.missions
                            .filter((m) => m.type === 'challenge')
                            .slice(0, 8),
                        ],
                        [
                          'Lo más popular',
                          state.missions.filter((m) => m.trending).slice(0, 8),
                        ],
                      ].map(([title, items]) => (
                        <View key={title as string} style={{ marginTop: 25 }}>
                          <View
                            style={{
                              paddingRight: 20,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: 12,
                            }}
                          >
                            <Text
                              style={{
                                color: colors.ink,
                                fontSize: 18,
                                fontWeight: '900',
                              }}
                            >
                              {title as string}
                            </Text>
                            <Pressable onPress={() => setSearching(true)}>
                              <Text
                                style={{
                                  color: colors.blue,
                                  fontSize: 12,
                                  fontWeight: '800',
                                }}
                              >
                                Ver todo
                              </Text>
                            </Pressable>
                          </View>
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingRight: 20 }}
                          >
                            {(items as Mission[]).map((m, index) => (
                              <MissionCard
                                key={m.id}
                                mission={m}
                                entranceIndex={index}
                                joined={state.user.joinedMissionIds.includes(
                                  m.id,
                                )}
                                memberName={state.user.name || 'Tú'}
                                onPress={() => openMission(m)}
                              />
                            ))}
                          </ScrollView>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}
              {category && !detail && (
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      paddingHorizontal: 20,
                      paddingTop: 15,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <Pressable onPress={() => setCategory(null)}>
                      {icon('arrow-left', 24)}
                    </Pressable>
                    <Text
                      style={{
                        fontSize: 24,
                        color: colors.ink,
                        fontWeight: '900',
                      }}
                    >
                      {interestLabels[category]} · planes
                    </Text>
                  </View>
                  <ScrollView
                    contentContainerStyle={{
                      padding: 18,
                      paddingBottom: 30,
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                    }}
                  >
                    {visible.slice(0, 40).map((m, index) => (
                      <View
                        key={m.id}
                        style={{ width: '48%', marginBottom: 12 }}
                      >
                        <MissionCard
                          mission={m}
                          wide={false}
                          entranceIndex={index}
                          joined={state.user.joinedMissionIds.includes(m.id)}
                          memberName={state.user.name || 'Tú'}
                          onPress={() => openMission(m)}
                        />
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
              {tab === 'Activity' && !category && !detail && (
                <ScrollView
                  contentContainerStyle={{ padding: 20, paddingBottom: 34 }}
                >
                  <Heading title="Mis misiones" />
                  <Text
                    style={{
                      color: colors.ink,
                      fontSize: 19,
                      fontWeight: '900',
                      marginTop: 8,
                      marginBottom: 13,
                    }}
                  >
                    EXPERIENCIAS
                  </Text>
                  {experiences.map((mission) => (
                    <Pressable
                      key={mission.id}
                      onPress={() => openMission(mission)}
                      accessibilityRole="button"
                      accessibilityLabel={`Experiencia: ${mission.title}`}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: 20,
                        padding: 17,
                        marginBottom: 11,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.ink,
                          fontWeight: '900',
                          fontSize: 15,
                        }}
                      >
                        {mission.title}
                      </Text>
                    </Pressable>
                  ))}
                  {experiences.length === 0 && (
                    <Text style={{ color: colors.muted, marginBottom: 18 }}>
                      Aún no te has unido a ninguna experiencia.
                    </Text>
                  )}
                  <Text
                    style={{
                      color: colors.ink,
                      fontSize: 19,
                      fontWeight: '900',
                      marginTop: 18,
                      marginBottom: 13,
                    }}
                  >
                    DESAFÍOS
                  </Text>
                  {challenges.map((mission) => (
                    <Pressable
                      key={mission.id}
                      onPress={() => openMission(mission)}
                      accessibilityRole="button"
                      accessibilityLabel={`Desafío: ${mission.title}`}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: 20,
                        padding: 17,
                        marginBottom: 11,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.ink,
                          fontWeight: '900',
                          fontSize: 15,
                        }}
                      >
                        🔥 {mission.title}
                      </Text>
                    </Pressable>
                  ))}
                  {challenges.length === 0 && (
                    <Text style={{ color: colors.muted }}>
                      Aún no te has unido a ningún desafío.
                    </Text>
                  )}
                </ScrollView>
              )}
              {tab === 'Profile' && !category && !detail && (
                <ScrollView
                  contentContainerStyle={{ padding: 20, paddingBottom: 35 }}
                >
                  <Heading
                    title="Tu perfil"
                    subtitle="Cada buena experiencia suma."
                  />
                  <View
                    style={{
                      backgroundColor: 'white',
                      borderRadius: 25,
                      padding: 20,
                      alignItems: 'center',
                    }}
                  >
                    <Avatar
                      name={state.user.name || 'H'}
                      color={colors.coral}
                      size={78}
                      uri={auth.profile?.avatar_url}
                    />
                    <TextInput
                      value={nameDraft || state.user.name}
                      onChangeText={(t) => {
                        setNameDraft(t);
                        state.updateName(t);
                      }}
                      onEndEditing={(event) => {
                        if (!auth.user) return;
                        const displayName = event.nativeEvent.text.trim();
                        if (!displayName) return;
                        void saveProfileDisplayName(auth.user.id, displayName)
                          .then(() => auth.refreshProfile())
                          .catch((error: unknown) => {
                            if (__DEV__)
                              console.error(
                                'Could not update profile name',
                                error,
                              );
                          });
                      }}
                      placeholder="Tu nombre"
                      style={{
                        fontSize: 22,
                        fontWeight: '900',
                        color: colors.ink,
                        textAlign: 'center',
                        marginTop: 9,
                        minWidth: 180,
                      }}
                    />
                    <Text
                      style={{
                        color: colors.muted,
                        fontSize: 13,
                        marginTop: 3,
                      }}
                    >
                      Explorador del barrio · nivel{' '}
                      {Math.floor(state.user.points / 500) + 1}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 11,
                        marginTop: 19,
                        width: '100%',
                      }}
                    >
                      <View
                        style={{
                          flex: 1,
                          backgroundColor: '#FFF7DF',
                          borderRadius: 16,
                          padding: 14,
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: '900',
                            fontSize: 21,
                            color: colors.ink,
                          }}
                        >
                          {state.user.points}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: colors.muted,
                            fontWeight: '700',
                          }}
                        >
                          HEYTU POINTS
                        </Text>
                      </View>
                      <View
                        style={{
                          flex: 1,
                          backgroundColor: '#F0ECFF',
                          borderRadius: 16,
                          padding: 14,
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: '900',
                            fontSize: 21,
                            color: colors.ink,
                          }}
                        >
                          {challenges.length}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: colors.muted,
                            fontWeight: '700',
                          }}
                        >
                          DESAFÍOS
                        </Text>
                      </View>
                      <View
                        style={{
                          flex: 1,
                          backgroundColor: '#E8F5EF',
                          borderRadius: 16,
                          padding: 14,
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: '900',
                            fontSize: 21,
                            color: colors.ink,
                          }}
                        >
                          {state.user.completedMissionIds.length}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: colors.muted,
                            fontWeight: '700',
                          }}
                        >
                          COMPLETADAS
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text
                    style={{
                      color: colors.ink,
                      fontSize: 19,
                      fontWeight: '900',
                      marginTop: 25,
                      marginBottom: 12,
                    }}
                  >
                    Tus intereses
                  </Text>
                  <View
                    style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}
                  >
                    {state.user.interests.map((i) => (
                      <Pill
                        key={i}
                        label={interestLabels[i]}
                        iconName={interestIcons[i]}
                        color={interestColors[i]}
                        selected
                      />
                    ))}
                  </View>
                  <Text
                    style={{
                      color: colors.ink,
                      fontSize: 19,
                      fontWeight: '900',
                      marginTop: 25,
                      marginBottom: 12,
                    }}
                  >
                    Logros desbloqueados
                  </Text>
                  {state.earnedAchievements.length === 0 && (
                    <Text
                      style={{
                        color: colors.muted,
                        fontSize: 13,
                        marginBottom: 12,
                      }}
                    >
                      Tu primer logro está más cerca de lo que crees.
                    </Text>
                  )}
                  <View
                    style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}
                  >
                    {achievements.map((a) => {
                      const earned = state.user.achievements.includes(a.id);
                      return (
                        <View
                          key={a.id}
                          style={{
                            width: '48%',
                            minHeight: 93,
                            borderRadius: 18,
                            padding: 13,
                            backgroundColor: earned ? 'white' : '#F3F0EA',
                            opacity: earned ? 1 : 0.62,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 8,
                            }}
                          >
                            <View
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                backgroundColor: `${a.color}25`,
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {icon(a.icon, 17, a.color)}
                            </View>
                            {!earned
                              ? icon('lock-outline', 14, colors.muted)
                              : null}
                          </View>
                          <Text
                            style={{
                              color: colors.ink,
                              fontWeight: '900',
                              fontSize: 12,
                              marginTop: 5,
                            }}
                          >
                            {a.title}
                          </Text>
                          <Text
                            style={{
                              color: colors.muted,
                              fontSize: 10,
                              marginTop: 3,
                            }}
                          >
                            {a.description}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                  <Text
                    style={{
                      color: colors.ink,
                      fontSize: 19,
                      fontWeight: '900',
                      marginTop: 25,
                      marginBottom: 12,
                    }}
                  >
                    Preferencias
                  </Text>
                  <View style={{ gap: 9 }}>
                    {state.user.preferences.map((p) => (
                      <View
                        key={p}
                        style={{
                          padding: 13,
                          backgroundColor: 'white',
                          borderRadius: 14,
                          flexDirection: 'row',
                          gap: 10,
                          alignItems: 'center',
                        }}
                      >
                        {icon('check-circle', 18, colors.green)}
                        <Text style={{ color: colors.ink, fontWeight: '700' }}>
                          {preferenceLabels[p]}
                        </Text>
                      </View>
                    ))}
                  </View>
                  {auth.user ? (
                    <View style={{ marginTop: 22, gap: 10 }}>
                      <Text
                        style={{
                          color: colors.muted,
                          fontSize: 13,
                          textAlign: 'center',
                        }}
                      >
                        {auth.profile?.email ?? auth.user.email ?? ''}
                      </Text>
                      <Action
                        label="Cerrar sesión"
                        tone="ink"
                        onPress={() => void auth.signOut()}
                      />
                      {auth.authError ? (
                        <Text
                          style={{ color: colors.coral, textAlign: 'center' }}
                        >
                          {auth.authError}
                        </Text>
                      ) : null}
                    </View>
                  ) : null}
                  {__DEV__ && (
                    <View
                      style={{
                        marginTop: 30,
                        padding: 15,
                        borderWidth: 1,
                        borderColor: '#F0B3AC',
                        borderRadius: 17,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.muted,
                          fontSize: 11,
                          fontWeight: '800',
                        }}
                      >
                        HERRAMIENTAS DE DESARROLLO
                      </Text>
                      {resetConfirm ? (
                        <View
                          style={{
                            flexDirection: 'row',
                            gap: 9,
                            marginTop: 10,
                          }}
                        >
                          <Action
                            label="BORRAR TODOS LOS DATOS"
                            tone="ink"
                            small
                            onPress={() => {
                              state.reset();
                              setPage('welcome');
                              setTab('Explore');
                              setDetail(null);
                              setResetConfirm(false);
                              setSelectedInterests([]);
                              setSelectedPreferencias([]);
                              setNameDraft('');
                            }}
                          />
                          <Pressable
                            onPress={() => setResetConfirm(false)}
                            style={{ justifyContent: 'center', padding: 8 }}
                          >
                            <Text
                              style={{ color: colors.muted, fontWeight: '800' }}
                            >
                              Cancel
                            </Text>
                          </Pressable>
                        </View>
                      ) : (
                        <Pressable
                          onPress={() => setResetConfirm(true)}
                          style={{ paddingVertical: 10 }}
                        >
                          <Text
                            style={{ color: colors.coral, fontWeight: '800' }}
                          >
                            Reiniciar introducción y todo el progreso
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  )}
                </ScrollView>
              )}
              {(!searchScreen || detail) && (
                <View
                  style={{
                    backgroundColor: 'white',
                    borderTopWidth: 1,
                    borderColor: colors.line,
                    paddingHorizontal: 19,
                    paddingTop: 9,
                    paddingBottom: Math.max(insets.bottom, 10),
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                  }}
                >
                  <Pressable
                    onPress={() => {
                      setTab('Explore');
                      setCategory(null);
                    }}
                    style={{ alignItems: 'center', gap: 3 }}
                  >
                    {icon(
                      'compass-outline',
                      22,
                      tab === 'Explore' ? colors.blue : colors.muted,
                    )}
                    <Text
                      style={{
                        fontSize: 10,
                        color: tab === 'Explore' ? colors.blue : colors.muted,
                        fontWeight: '800',
                      }}
                    >
                      Explorar
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setCreateOpen(true)}
                    style={{
                      width: 51,
                      height: 45,
                      borderRadius: 16,
                      backgroundColor: colors.blue,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: -22,
                      borderWidth: 4,
                      borderColor: 'white',
                    }}
                  >
                    {icon('plus', 25, 'white')}
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setTab('Activity');
                      setCategory(null);
                    }}
                    style={{ alignItems: 'center', gap: 3 }}
                  >
                    {icon(
                      'calendar-heart',
                      22,
                      tab === 'Activity' ? colors.blue : colors.muted,
                    )}
                    <Text
                      style={{
                        fontSize: 10,
                        color: tab === 'Activity' ? colors.blue : colors.muted,
                        fontWeight: '800',
                      }}
                    >
                      Misiones
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setTab('Profile');
                      setCategory(null);
                    }}
                    style={{ alignItems: 'center', gap: 3 }}
                  >
                    {icon(
                      'account-outline',
                      22,
                      tab === 'Profile' ? colors.blue : colors.muted,
                    )}
                    <Text
                      style={{
                        fontSize: 10,
                        color: tab === 'Profile' ? colors.blue : colors.muted,
                        fontWeight: '800',
                      }}
                    >
                      Perfil
                    </Text>
                  </Pressable>
                </View>
              )}
            </>
          )}
          {createOpen && (
            <View
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: '#17233C88',
                justifyContent: 'flex-end',
              }}
            >
              <Pressable
                style={{ flex: 1 }}
                onPress={() => setCreateOpen(false)}
              />
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              >
                <View
                  style={{
                    backgroundColor: colors.cream,
                    borderTopLeftRadius: 28,
                    borderTopRightRadius: 28,
                    paddingHorizontal: 21,
                    paddingTop: 22,
                    paddingBottom: Math.max(insets.bottom, 20),
                    maxHeight: '90%',
                  }}
                >
                  <ScrollView keyboardShouldPersistTaps="handled">
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          color: colors.ink,
                          fontSize: 25,
                          fontWeight: '900',
                        }}
                      >
                        Crea un plan
                      </Text>
                      <Pressable onPress={() => setCreateOpen(false)}>
                        {icon('close', 23)}
                      </Pressable>
                    </View>
                    <Text
                      style={{
                        color: colors.muted,
                        marginTop: 5,
                        marginBottom: 14,
                      }}
                    >
                      Las cosas buenas empiezan cuando alguien da el primer
                      paso.
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {(
                        [
                          'experience',
                          'volunteer',
                          'challenge',
                        ] as MissionType[]
                      ).map((t) => (
                        <Pressable
                          key={t}
                          onPress={() => setCreatingType(t)}
                          style={{
                            flex: 1,
                            padding: 11,
                            borderRadius: 13,
                            backgroundColor:
                              creatingType === t
                                ? missionTypeMeta[t].color
                                : 'white',
                            alignItems: 'center',
                          }}
                        >
                          <Text
                            style={{
                              color: creatingType === t ? 'white' : colors.ink,
                              fontWeight: '800',
                              fontSize: 11,
                            }}
                          >
                            {missionTypeMeta[t].label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                    {[
                      [formTitle, setFormTitle, '¿Cómo se llama el plan?'],
                      [formLocation, setFormLocation, '¿Dónde se reunirán?'],
                      [
                        formDescription,
                        setFormDescription,
                        '¿De qué se trata?',
                      ],
                    ].map(([value, setter, placeholder], i) => (
                      <TextInput
                        key={placeholder as string}
                        value={value as string}
                        onChangeText={setter as (v: string) => void}
                        placeholder={placeholder as string}
                        multiline={i === 2}
                        placeholderTextColor="#98A0AE"
                        style={{
                          backgroundColor: 'white',
                          borderRadius: 15,
                          padding: 14,
                          marginTop: 11,
                          color: colors.ink,
                          minHeight: i === 2 ? 83 : 48,
                          textAlignVertical: 'top',
                        }}
                      />
                    ))}
                    <View style={{ marginTop: 14 }}>
                      <Action
                        label="PUBLICAR PLAN"
                        disabled={!formTitle.trim() || !formLocation.trim()}
                        onPress={() => {
                          const c = state.missions[0];
                          const m: Mission = {
                            ...c,
                            id: `local-${Date.now()}`,
                            title: formTitle.trim(),
                            location: formLocation.trim(),
                            neighborhood: formLocation.trim(),
                            description:
                              formDescription.trim() ||
                              'Un plan para reunirse, compartir algo bueno y crear un nuevo recuerdo.',
                            type: creatingType,
                            host: state.user.name || 'Tú',
                            custom: true,
                            points: missionTypeMeta[creatingType].points,
                            dayOffset: 2,
                            participants: [],
                            imageUrl: c.imageUrl,
                            challengeDays:
                              creatingType === 'challenge' ? 14 : undefined,
                          };
                          state.addCreatedMission(m);
                          setCreateOpen(false);
                          setFormTitle('');
                          setFormLocation('');
                          setFormDescription('');
                          setToast('¡Tu plan ya está publicado! 🌟');
                          setTab('Explore');
                        }}
                      />
                    </View>
                  </ScrollView>
                </View>
              </KeyboardAvoidingView>
            </View>
          )}
          {toast ? (
            <Animated.View
              entering={FadeInDown.springify()}
              exiting={FadeOut.duration(170)}
              style={{
                position: 'absolute',
                left: 19,
                right: 19,
                bottom: 92 + insets.bottom,
                backgroundColor: colors.ink,
                padding: 15,
                borderRadius: 16,
              }}
            >
              <Text
                style={{
                  color: 'white',
                  textAlign: 'center',
                  fontWeight: '800',
                }}
              >
                {toast}
              </Text>
            </Animated.View>
          ) : null}
          {state.storageError ? (
            <View
              style={{
                position: 'absolute',
                top: topInset + 6,
                left: 12,
                right: 12,
                padding: 10,
                backgroundColor: '#FFF0E4',
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  color: colors.coral,
                  textAlign: 'center',
                  fontSize: 11,
                }}
              >
                No se pudieron guardar algunos cambios. Tu sesión actual sigue
                disponible.
              </Text>
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}
