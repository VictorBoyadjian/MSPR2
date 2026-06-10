export const CONFIG = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api',
  IMAGE_ANALYSIS_URL: process.env.EXPO_PUBLIC_IMAGE_ANALYSIS_URL ?? 'http://localhost:8001',
  API_TIMEOUT_MS: 10_000,
  TOKEN_STORAGE_KEY: '@healthai/token',
} as const;
