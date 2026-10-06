import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { MotionProbe } from '@/components/motion/MotionProbe';
import { readStorage, removeStorage, writeStorage } from '@/lib/storage';

export function FoundationVerificationPanel() {
  const insets = useSafeAreaInsets();
  const [pressCount, setPressCount] = useState(0);
  const [storageStatus, setStorageStatus] = useState('Checking local storage…');

  useEffect(() => {
    const key = '@heytu/verification';
    let active = true;

    async function verifyStorage() {
      try {
        await writeStorage(key, { ok: true });
        const value = await readStorage<{ ok: boolean }>(key);
        if (active)
          setStorageStatus(
            value?.ok ? 'Local storage: ready' : 'Local storage: failed',
          );
      } catch (error) {
        if (active) {
          setStorageStatus(
            `Local storage: ${error instanceof Error ? error.message : 'failed'}`,
          );
        }
      } finally {
        try {
          await removeStorage(key);
        } catch (error) {
          if (active) {
            setStorageStatus(
              `Local storage cleanup: ${error instanceof Error ? error.message : 'failed'}`,
            );
          }
        }
      }
    }

    void verifyStorage();
    return () => {
      active = false;
    };
  }, []);

  const handlePress = () => {
    setPressCount((count) => count + 1);
    void Haptics.selectionAsync();
  };

  return (
    <View
      className="flex-1 items-center justify-center bg-slate-50 px-6"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-sm">
        <Text className="text-2xl font-bold text-slate-900">
          HEYTU foundation
        </Text>
        <Text className="mt-2 text-sm text-slate-600">
          Development verification route
        </Text>
        <View className="mt-6 items-center gap-4">
          <MotionProbe key={pressCount} />
          <Text className="text-sm text-slate-500">{storageStatus}</Text>
          <MaterialCommunityIcons
            name="check-circle-outline"
            size={24}
            color="#4F46E5"
            accessibilityLabel="Icon system loading check"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Run animation and haptics check"
            onPress={handlePress}
            className="rounded-xl bg-indigo-600 px-5 py-3"
          >
            <Text className="font-semibold text-white">
              Run interaction check
            </Text>
          </Pressable>
          <Text className="text-sm text-slate-500">
            Interactions: {pressCount}
          </Text>
        </View>
      </View>
    </View>
  );
}
