import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ProfileButton from '@/components/profile/ProfileButton';
import SettingsMenu from '@/components/profile/SettingsMenu';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function AppBar() {
  const theme = useTheme();

  return (
    <ThemedView style={[styles.container, { borderBottomColor: theme.backgroundSelected }]}>
      <SafeAreaView edges={['top', 'left', 'right']}>
        <ThemedView style={styles.bar}>
          <ThemedText type="smallBold">HealthAI - Coach</ThemedText>
          <ThemedView style={styles.actions}>
            <ProfileButton />
            <SettingsMenu />
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
});
