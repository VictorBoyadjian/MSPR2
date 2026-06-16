import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { createElement, useState } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useColorSchemeResolved, useTheme } from '@/hooks/use-theme';
import { formatDate, formatDateTime } from '@/utils/formatDate';

type Props = {
  value: Date;
  onChange: (date: Date) => void;
  /** 'datetime' ajoute la sélection de l'heure (défaut : date seule). */
  mode?: 'date' | 'datetime';
};

const pad = (n: number) => String(n).padStart(2, '0');
const toLocalDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toLocalDateTime = (d: Date) => `${toLocalDate(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

export default function DateTimeField({ value, onChange, mode = 'date' }: Props) {
  const theme = useTheme();
  const scheme = useColorSchemeResolved();
  const withTime = mode === 'datetime';
  // Android : sélection en deux temps (date puis heure).
  const [androidStep, setAndroidStep] = useState<'date' | 'time' | null>(null);

  // Web : le picker natif n'existe pas, on utilise un <input> HTML.
  if (Platform.OS === 'web') {
    return createElement('input', {
      type: withTime ? 'datetime-local' : 'date',
      value: withTime ? toLocalDateTime(value) : toLocalDate(value),
      onChange: (e: { target: { value: string } }) => {
        const d = new Date(e.target.value);
        if (!Number.isNaN(d.getTime())) onChange(d);
      },
      style: {
        padding: '8px 12px',
        borderRadius: 8,
        border: `1px solid ${theme.backgroundSelected}`,
        background: theme.backgroundElement,
        color: theme.text,
        fontSize: 14,
      },
    });
  }

  if (Platform.OS === 'ios') {
    return (
      <DateTimePicker
        value={value}
        mode={withTime ? 'datetime' : 'date'}
        display="compact"
        // Aligne la pastille du picker sur le thème courant (sinon fond noir
        // par défaut sur un fond clair/gris) et reprend l'accent de l'app.
        themeVariant={scheme}
        accentColor={theme.accent}
        onChange={(_, date) => date && onChange(date)}
      />
    );
  }

  const onAndroidDate = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type !== 'set' || !date) {
      setAndroidStep(null);
      return;
    }
    // Conserve l'heure actuelle, met à jour la date.
    const next = new Date(value);
    next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    if (withTime) {
      onChange(next);
      setAndroidStep('time');
    } else {
      onChange(next);
      setAndroidStep(null);
    }
  };

  const onAndroidTime = (event: DateTimePickerEvent, date?: Date) => {
    setAndroidStep(null);
    if (event.type !== 'set' || !date) return;
    const next = new Date(value);
    next.setHours(date.getHours(), date.getMinutes(), 0, 0);
    onChange(next);
  };

  return (
    <>
      <Pressable
        onPress={() => setAndroidStep('date')}
        style={[styles.trigger, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText type="small">{withTime ? formatDateTime(value) : formatDate(value)}</ThemedText>
      </Pressable>
      {androidStep === 'date' ? (
        <DateTimePicker value={value} mode="date" onChange={onAndroidDate} />
      ) : null}
      {androidStep === 'time' ? (
        <DateTimePicker value={value} mode="time" onChange={onAndroidTime} />
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
