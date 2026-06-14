import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDate } from '@/utils/formatDate';

type Props = {
  value: Date;
  onChange: (date: Date) => void;
};

export default function DateTimeField({ value, onChange }: Props) {
  const theme = useTheme();
  const [showAndroid, setShowAndroid] = useState(false);

  if (Platform.OS === 'ios') {
    return (
      <DateTimePicker
        value={value}
        mode="date"
        display="compact"
        onChange={(_, date) => date && onChange(date)}
      />
    );
  }

  const handleAndroid = (event: DateTimePickerEvent, date?: Date) => {
    setShowAndroid(false);
    if (event.type === 'set' && date) onChange(date);
  };

  return (
    <>
      <Pressable
        onPress={() => setShowAndroid(true)}
        style={[styles.trigger, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText type="small">{formatDate(value)}</ThemedText>
      </Pressable>
      {showAndroid ? (
        <DateTimePicker value={value} mode="date" onChange={handleAndroid} />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
});
