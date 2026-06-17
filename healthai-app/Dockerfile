# =============================================================================
# HealthAI App (Expo / React Native) - build web statique + service de fichiers
# -----------------------------------------------------------------------------
# L'app est une app Expo Router avec une cible web (react-native-web).
# On l'exporte en statique (expo export --platform web) puis on sert le dossier
# dist/ avec un petit serveur HTTP.
#
# Les variables EXPO_PUBLIC_* sont injectees DANS le bundle au moment du build
# (elles ne sont pas lues a l'execution cote navigateur). Elles arrivent donc
# ici en ARG, passes par docker-compose. Comme l'app tourne dans le navigateur
# de l'hote, les URLs doivent pointer vers localhost (et non les noms de
# services Docker, inaccessibles depuis le navigateur).
# =============================================================================

# ---------- Etape 1 : build du bundle web ----------
FROM node:20-bookworm-slim AS build

WORKDIR /app

# Dependances d'abord (cache Docker tant que package*.json ne change pas)
# npm install (et non npm ci) : le package-lock.json est genere sous Windows et
# il manque des deps natives optionnelles propres a Linux (@emnapi/runtime, ...),
# ce qui fait echouer le mode strict de npm ci dans le conteneur.
COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund

# Code source
COPY . .

# Variables publiques Expo (inlinees dans le bundle au build)
ARG EXPO_PUBLIC_API_URL=http://localhost:8080/api
ARG EXPO_PUBLIC_IMAGE_API_URL=http://localhost:2021
ARG EXPO_PUBLIC_RECO_API_URL=http://localhost:8000
ARG EXPO_PUBLIC_AI_IMAGE_SOURCE=MISTRAL

ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL \
    EXPO_PUBLIC_IMAGE_API_URL=$EXPO_PUBLIC_IMAGE_API_URL \
    EXPO_PUBLIC_RECO_API_URL=$EXPO_PUBLIC_RECO_API_URL \
    EXPO_PUBLIC_AI_IMAGE_SOURCE=$EXPO_PUBLIC_AI_IMAGE_SOURCE \
    CI=1

RUN npx expo export --platform web --output-dir dist

# ---------- Etape 2 : service des fichiers statiques ----------
FROM node:20-bookworm-slim AS serve

WORKDIR /app

# 'serve' avec -s : SPA fallback (toutes les routes renvoient index.html)
RUN npm install -g serve@14

COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
