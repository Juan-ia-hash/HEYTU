import {
  Easing,
  FadeInDown,
  FadeOutDown,
  LinearTransition,
  type WithSpringConfig,
  type WithTimingConfig,
} from 'react-native-reanimated';

export const motionDuration = {
  instant: 100,
  fast: 180,
  normal: 280,
  slow: 420,
} as const;

export const motionEasing = {
  standard: Easing.bezier(0.2, 0, 0, 1),
  emphasized: Easing.bezier(0.2, 0, 0, 1),
  exit: Easing.bezier(0.4, 0, 1, 1),
} as const;

export const springPresets: Record<'gentle' | 'snappy', WithSpringConfig> = {
  gentle: { damping: 18, stiffness: 140, mass: 0.9 },
  snappy: { damping: 22, stiffness: 280, mass: 0.72 },
};

export const timingPresets: Record<'enter' | 'exit', WithTimingConfig> = {
  enter: { duration: motionDuration.normal, easing: motionEasing.standard },
  exit: { duration: motionDuration.fast, easing: motionEasing.exit },
};

export const motionPresets = {
  press: springPresets.snappy,
  selection: {
    damping: 16,
    stiffness: 240,
    mass: 0.62,
  } satisfies WithSpringConfig,
  entrance: {
    damping: 18,
    stiffness: 150,
    mass: 0.82,
  } satisfies WithSpringConfig,
  success: {
    damping: 14,
    stiffness: 190,
    mass: 0.78,
  } satisfies WithSpringConfig,
  attention: {
    damping: 17,
    stiffness: 210,
    mass: 0.7,
  } satisfies WithSpringConfig,
  progress: {
    duration: 520,
    easing: motionEasing.standard,
  } satisfies WithTimingConfig,
  navigation: {
    damping: 24,
    stiffness: 210,
    mass: 0.86,
  } satisfies WithSpringConfig,
} as const;

export const staggerEntrance = (index: number) =>
  FadeInDown.delay(Math.min(index * 55, 330))
    .duration(motionDuration.normal)
    .easing(motionEasing.standard);

export const staggerExit = FadeOutDown.duration(motionDuration.fast);
export const layoutTransition = LinearTransition.springify()
  .damping(22)
  .stiffness(230);
