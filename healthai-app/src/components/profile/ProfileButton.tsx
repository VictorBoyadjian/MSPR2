import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import Icon from '@/components/ui/Icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Icône d'accès à la page Profil (barre du haut). */
export default function ProfileButton() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Profil"
      onPress={() => router.push('/profile')}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.7 : 1 },
      ]}>
      <Icon name="profile-filled" size={20} color={theme.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
