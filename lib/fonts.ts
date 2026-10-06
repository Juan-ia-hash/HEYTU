import { useFonts, type FontSource } from 'expo-font';

export function useAppFonts(fonts: Record<string, FontSource>) {
  return useFonts(fonts);
}
