// Bouton principal néon du footer de l'onboarding.
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { accent, colors } from '../theme';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export default function PrimaryButton({ label, onPress, disabled, loading }: PrimaryButtonProps) {
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.btn,
        inactive && styles.btnDisabled,
        pressed && !inactive && styles.btnPressed,
      ]}>
      {loading ? (
        <ActivityIndicator color={colors.ink} />
      ) : (
        <Text style={styles.btnTx}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 58,
    borderRadius: 18,
    backgroundColor: accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: accent,
    shadowOpacity: 0.32,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
  },
  btnDisabled: { opacity: 0.28, shadowOpacity: 0 },
  btnPressed: { transform: [{ scale: 0.98 }] },
  btnTx: { fontWeight: '600', fontSize: 16, color: colors.ink, letterSpacing: -0.2 },
});
