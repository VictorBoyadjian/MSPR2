# HealthAI — Onboarding (React Native / Expo)

React Native port of the HealthAI onboarding flow: account creation in 9 logical screens
(prénom → âge → taille → poids → sport → silhouette → mesure du pouls → récap → confirmation),
dark / neon theme, tactile "ruler" pickers, 6 body-fat silhouettes, and a 30-second pulse-count flow.

## Stack

- **Expo (SDK 51) + JavaScript** — runs on iOS, Android and web.
- **react-native-svg** — silhouettes, heart glyph, measuring ring.
- **Animated** (built-in) — countdown pop, the rotating 30 s wheel, heartbeats, screen transitions. No Reanimated dependency.
- **@expo-google-fonts/space-grotesk** — typography.
- Navigation is a small internal state machine (linear flow) — no navigation library needed.

## Setup

The fastest path is to drop these files into a fresh Expo app so the native config is generated for you:

```bash
# 1. create a blank Expo app
npx create-expo-app healthai-onboarding --template blank
cd healthai-onboarding

# 2. copy these files in (overwrite App.js), keeping the folder layout:
#    App.js  Onboarding.js  theme.js
#    components/RulerPicker.js  components/BodySilhouette.js  components/Heart.js
#    screens/DataScreens.js  screens/BpmScreens.js

# 3. install the runtime deps (expo install picks versions matching your SDK)
npx expo install react-native-svg react-native-safe-area-context expo-font
npm install @expo-google-fonts/space-grotesk

# 4. run it
npx expo start
```

Press `i` (iOS simulator), `a` (Android emulator), or scan the QR code with Expo Go.

> The included `package.json` lists versions known to work together on SDK 51. If you start
> from `create-expo-app` you can ignore it and let `expo install` pick versions for your SDK.

## File map

| File | Role |
|------|------|
| `App.js` | Entry point — loads fonts, sets the dark status bar. |
| `theme.js` | Colors, fonts, helpers. **Change `accent` here to re-skin the app.** |
| `Onboarding.js` | State machine: step order, progress bar, footer button, transitions. |
| `components/RulerPicker.js` | Horizontal snap-scroll value picker (âge / taille / poids / sport). |
| `components/BodySilhouette.js` | Parametric SVG body silhouette, levels 0–5. |
| `components/Heart.js` | Heart glyph with an optional beat animation. |
| `screens/DataScreens.js` | Welcome, Name, Age, Height, Weight, Sport, BodyFat, Summary, Done. |
| `screens/BpmScreens.js` | BPM intro, 3·2·1 countdown, 30 s measuring wheel, count entry. |

## Notes & next steps

- **Resting BPM** = beats counted over 30 s × 2. The wheel runs for a real 30 seconds.
- **Silhouettes** are stylized placeholders drawn with SVG — swap in dedicated illustrations
  (or per-gender sets) when available.
- The original web prototype had a live "accent color" tweak; here the accent is a single
  constant in `theme.js`. Wire it to app settings if you want it user-configurable.
- No backend is included — `data` (name/age/height/weight/sport/bodyFat/beats) lives in
  `Onboarding.js` state. Submit it from the `summary → done` transition (`next()`).
- `tabular-nums` renders on iOS out of the box; Space Grotesk provides it on Android too.
