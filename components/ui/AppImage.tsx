import { Image, type ImageProps } from 'expo-image';

export function AppImage(props: ImageProps) {
  return <Image cachePolicy="memory-disk" transition={180} {...props} />;
}
