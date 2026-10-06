import AsyncStorage from '@react-native-async-storage/async-storage';

export async function readStorage<T>(key: string): Promise<T | null> {
  const value = await AsyncStorage.getItem(key);
  if (value === null) return null;
  return JSON.parse(value) as T;
}

export async function writeStorage<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeStorage(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}
