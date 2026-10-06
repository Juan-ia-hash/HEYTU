export const appEnvironment = process.env.APP_ENV ?? 'development';

export const publicEnvironment = {
  appEnvironment,
} as const;
