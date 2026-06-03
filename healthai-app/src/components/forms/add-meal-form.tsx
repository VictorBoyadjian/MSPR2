import { ThemedView } from '@/components/themed-view';
import { Platform, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';

export default function AddMealForm() {
    return (
        <ThemedView style={styles.container}>
          <ThemedView style={styles.heroSection}>
            <ThemedText type="title" style={styles.title}>
              Ajouter un repas
            </ThemedText>
          </ThemedView>
          
        </ThemedView>
    );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column',
  },
  heroSection: {
    flex: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
  },
});