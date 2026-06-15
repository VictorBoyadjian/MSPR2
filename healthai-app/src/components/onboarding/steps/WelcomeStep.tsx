// Écran d'accueil de l'onboarding.
import { StyleSheet, Text, View } from 'react-native';

import { accent, accentA, colors } from '../theme';

export default function WelcomeStep({ firstName }: { firstName?: string }) {
  return (
    <View style={styles.welcome}>
      <View style={styles.brandMark}>
        <View style={styles.brandPulse} />
      </View>
      <View>
        <Text style={styles.eyebrow}>HEALTHAI</Text>
        <Text style={styles.title}>
          {firstName ? `Bienvenue ${firstName},\n` : ''}construisons ton profil santé.
        </Text>
        <Text style={styles.sub}>
          Quelques questions rapides pour calibrer tes objectifs et mesurer ton rythme cardiaque au repos.
        </Text>
      </View>
      <View style={styles.meta}>
        <Text style={styles.metaTx}>7 étapes</Text>
        <View style={styles.dotSep} />
        <Text style={styles.metaTx}>≈ 2 min</Text>
        <View style={styles.dotSep} />
        <Text style={styles.metaTx}>Confidentiel</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  welcome: { gap: 30 },
  brandMark: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: accentA(0.14),
    borderWidth: 1,
    borderColor: accentA(0.4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandPulse: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: accent,
    shadowColor: accent,
    shadowOpacity: 0.8,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  eyebrow: { fontWeight: '600', letterSpacing: 1.9, fontSize: 12, color: accent },
  title: { fontWeight: '600', fontSize: 34, color: colors.tx, letterSpacing: -0.9, lineHeight: 40, marginTop: 12 },
  sub: { fontSize: 15, color: colors.tx2, lineHeight: 22, marginTop: 12 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  metaTx: { fontSize: 13, color: colors.tx3 },
  dotSep: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.tx3 },
});
