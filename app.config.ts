import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'HEYTU',
  slug: 'heytu',
  scheme: 'heytu',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  platforms: ['ios', 'android', 'web'],
  plugins: [
    'expo-router',
    'expo-font',
    ['expo-splash-screen', { backgroundColor: '#F8FAFC' }],
    'expo-web-browser',
  ],
  experiments: { typedRoutes: true },
  extra: {
    environment:
      process.env.APP_ENV ??
      (process.env.NODE_ENV === 'production' ? 'production' : 'development'),
  },
};

export default config;
