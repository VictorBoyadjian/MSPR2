export const CONFIG = {
  API_BASE_URL:
    process.env.EXPO_PUBLIC_API_URL ?? 'https://mspr2-api-production.up.railway.app/api',
  API_TIMEOUT_MS: 15_000,
  TOKEN_STORAGE_KEY: 'healthai_token',
  IMAGE_API_URL: process.env.EXPO_PUBLIC_IMAGE_API_URL ?? 'https://ollama-api-production-44b6.up.railway.app'
} as const;
