// Ensure process.env exists and has EXPO_PUBLIC vars
if (!global.process) global.process = {};
if (!global.process.env) global.process.env = {};

process.env.EXPO_PUBLIC_AI_IMAGE_SOURCE = 'MISTRAL';
process.env.EXPO_PUBLIC_API_URL = 'https://mspr2-api-production.up.railway.app/api';
process.env.EXPO_PUBLIC_IMAGE_API_URL = 'https://ollama-api-production-44b6.up.railway.app';
process.env.EXPO_PUBLIC_RECO_API_URL = 'https://mlmspr2-production.up.railway.app';
