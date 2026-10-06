import * as Haptics from 'expo-haptics';

export async function selectionHaptic(): Promise<void> {
  try {
    await Haptics.selectionAsync();
  } catch (error) {
    if (__DEV__)
      console.warn('Selection haptic is unavailable on this device.', error);
  }
}

export async function successHaptic(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    if (__DEV__)
      console.warn('Success haptic is unavailable on this device.', error);
  }
}
