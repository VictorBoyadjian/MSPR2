import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedText themeColor="textSecondary">Bonjour,</ThemedText>
          <ThemedText type="subtitle">{user?.first_name ?? 'Athlète'} 💪</ThemedText>
        </ThemedView>

        <Card>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Profil
          </ThemedText>
          <ThemedText>{user?.email}</ThemedText>
          {user?.weight_kg ? (
            <ThemedText themeColor="textSecondary">
              {user.weight_kg} kg · {user.height_cm} cm
            </ThemedText>
          ) : null}
        </Card>

        <ThemedView style={styles.actions}>
          <Button label="🍽️  Enregistrer un repas" onPress={() => router.push('/meal/add')} />
          <Button label="🏋️  Nouvelle séance" onPress={() => router.push('/workout/add')} />
        </ThemedView>

        <ThemedView style={styles.spacer} />
        <Button label="Se déconnecter" variant="secondary" onPress={logout} />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.four,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  header: { gap: Spacing.one },
  actions: { gap: Spacing.three },
  spacer: { flex: 1 },
});
