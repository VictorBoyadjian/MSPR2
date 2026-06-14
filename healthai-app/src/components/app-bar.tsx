import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ProfileMenu from '@/components/profile/ProfileMenu';
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
          <ThemedText type="smallBold">HealthAI</ThemedText>
          <ProfileMenu />
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
});
