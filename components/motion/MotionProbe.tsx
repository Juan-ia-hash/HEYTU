import { useEffect } from 'react';
import Animated, {
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { springPresets } from '@/lib/motion';

export function MotionProbe() {
  const progress = useSharedValue(0);
  const style = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: 0.35 + progress.value * 0.65,
      transform: [
        { translateX: progress.value * 34 },
        { scale: 0.7 + progress.value * 0.3 },
      ],
    };
  });

  useEffect(() => {
    runOnUI(() => {
      'worklet';
      progress.value = withSpring(1, springPresets.gentle);
    })();
  }, [progress]);

  return (
    <Animated.View
      accessibilityLabel="Reanimated worklet spring probe"
      className="h-14 w-14 rounded-2xl bg-indigo-500"
      style={style}
    />
  );
}
