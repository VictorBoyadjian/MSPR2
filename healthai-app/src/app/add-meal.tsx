import * as Device from 'expo-device';
import { Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { AddMealButton, SplashAnimation } from '@/components/add-meal/add-meal-button';
import { ModalButtonContainer } from '@/components/ui/modal-button-container';
import Camera from '@/components/ui/camera';

function getDevMenuHint() {
  if (Platform.OS === 'web') {
    return <ThemedText type="small">use browser devtools</ThemedText>;
  }
  if (Device.isDevice) {
    return (
      <ThemedText type="small">
        shake device or press <ThemedText type="code">m</ThemedText> in terminal
      </ThemedText>
    );
  }
  const shortcut = Platform.OS === 'android' ? 'cmd+m (or ctrl+m)' : 'cmd+d';
  return (
    <ThemedText type="small">
      press <ThemedText type="code">{shortcut}</ThemedText>
    </ThemedText>
  );
}

export default function TabThreeScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          <ThemedText type="title" style={styles.title}>
            Ajouter un repas
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.stepContainer}>
          <ThemedView style={styles.mealRow}>
            <ThemedText type="smallBold" style={styles.title}>
              Petit déjeuner
            </ThemedText>
            <SplashAnimation />
            <ModalButtonContainer 
              buttonChild={
                <AddMealButton />
                } 
              modalChild={
                <ThemedText style={styles.mealRow}>Show Modal</ThemedText>
              } 
            />
          </ThemedView>
          <ThemedView style={styles.mealRow}>
            <ThemedText type="smallBold" style={styles.title}>
              Déjeuner
            </ThemedText>
            <SplashAnimation />
            <ModalButtonContainer 
              buttonChild={
                <AddMealButton />
                } 
              modalChild={
               <Camera />
              } 
            />
          </ThemedView>
          <ThemedView style={styles.mealRow}>
            <ThemedText type="smallBold" style={styles.title}>
              Diner
            </ThemedText>
            <SplashAnimation />
            <ModalButtonContainer
              buttonChild={
                <AddMealButton />
                } 
              modalChild={
                <ThemedText style={styles.mealRow}>Show Modal</ThemedText>
              } 
            />
          </ThemedView>
        </ThemedView>


        {Platform.OS === 'web' && <WebBadge />}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    textAlign: 'center',
  },
  code: {
    textTransform: 'uppercase',
  },
  stepContainer: {
    gap: Spacing.three,
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
  mealRow: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
});
