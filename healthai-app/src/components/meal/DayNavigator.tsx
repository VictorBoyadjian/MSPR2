import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { addDays, formatDayLabel } from '@/utils/day';

type Props = {
  value: Date;
  onChange: (date: Date) => void;
};

export default function DayNavigator({ value, onChange }: Props) {
  return (
    <ThemedView style={styles.container}>
      <Pressable hitSlop={Spacing.three} onPress={() => onChange(addDays(value, -1))}>
        <ThemedText type="subtitle">‹</ThemedText>
      </Pressable>
      <ThemedText type="smallBold">{formatDayLabel(value)}</ThemedText>
      <Pressable hitSlop={Spacing.three} onPress={() => onChange(addDays(value, 1))}>
        <ThemedText type="subtitle">›</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
  },
});
