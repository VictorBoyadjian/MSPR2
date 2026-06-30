import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function AddMealScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <ThemedText type="subtitle">Ajouter un repas</ThemedText>
          <ThemedText type="small">Comment souhaitez-vous l&apos;enregistrer ?</ThemedText>

          <View style={styles.options}>
            <Pressable
              onPress={() => router.push('/meal/scanDishPage')}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.8 : 1 },
              ]}>
              <Icon name="camera" size={40} color={theme.text} />
              <ThemedText type="smallBold">Scanner mon repas</ThemedText>
              <ThemedText type="small" style={styles.cardHint}>
                Reconnais les aliments de ton assiette, grâce à l&apos;IA&nbsp;!
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={() => router.push('/meal/add-form')}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.8 : 1 },
              ]}>
              <Icon name="edit" size={40} color={theme.text} />
              <ThemedText type="smallBold">Enregistrer à la main</ThemedText>
              <ThemedText type="small" style={styles.cardHint}>
                Saisissez vous-même les informations du repas.
              </ThemedText>
            </Pressable>
          </View>

          <Button label="Annuler" variant="secondary" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  content: { flex: 1, padding: Spacing.four, gap: Spacing.three },
  options: { flex: 1, gap: Spacing.three, justifyContent: 'center' },
  card: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.two,
    alignItems: 'center',
  },
  cardHint: { textAlign: 'center', opacity: 0.7 },
});
