export const CONFIG = {
  AI_IMAGE_SOURCE: process.env.EXPO_PUBLIC_AI_IMAGE_SOURCE ?? 'MISTRAL',
  API_BASE_URL:
    process.env.EXPO_PUBLIC_API_URL ?? 'https://mspr2-api-production.up.railway.app/api',
  API_TIMEOUT_MS: 15_000,
  TOKEN_STORAGE_KEY: 'healthai_token',
  IMAGE_API_URL: process.env.EXPO_PUBLIC_IMAGE_API_URL ?? 'https://ollama-api-production-44b6.up.railway.app',
  RECO_API_URL: process.env.EXPO_PUBLIC_RECO_API_URL ?? 'https://mlmspr2-production.up.railway.app'
} as const;
