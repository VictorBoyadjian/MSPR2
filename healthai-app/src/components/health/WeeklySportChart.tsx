// Histogramme des heures de sport par jour sur la semaine en cours (lundi → dimanche).
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { DaySportHours } from '@/types/health.type';

const BAR_AREA = 120;
const DAY_LETTERS = ['D', 'L', 'M', 'M', 'J', 'V', 'S']; // index = Date.getDay()

/** Date locale du jour au format `YYYY-MM-DD`, pour repérer la colonne « aujourd'hui ». */
function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Lettre du jour de la semaine sans dérive de fuseau (parse explicite des composantes). */
function dayLetter(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return DAY_LETTERS[new Date(y, m - 1, d).getDay()];
}

/** Heures formatées de façon compacte pour l'étiquette d'une barre (ex. « 1,5 »). */
function shortHours(hours: number): string {
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1).replace('.', ',');
}

export default function WeeklySportChart({ week }: { week: DaySportHours[] }) {
  const theme = useTheme();
  const today = localToday();
  // L'API peut renvoyer les heures en chaîne : on normalise avant tout calcul.
  const days = week.map((d) => ({ ...d, hours: Number(d.hours) || 0 }));
  const max = Math.max(0.5, ...days.map((d) => d.hours));

  return (
    <View style={styles.chart}>
      {days.map((day) => {
        const isToday = day.date === today;
        const ratio = max > 0 ? day.hours / max : 0;
        return (
          <View key={day.date} style={styles.col}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.value}>
              {day.hours > 0 ? shortHours(day.hours) : ''}
            </ThemedText>
            <View style={styles.barArea}>
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max(ratio * BAR_AREA, day.hours > 0 ? 4 : 0),
                    backgroundColor: isToday ? theme.text : theme.backgroundSelected,
                  },
                ]}
              />
            </View>
            <ThemedText
              type={isToday ? 'smallBold' : 'small'}
              themeColor={isToday ? 'text' : 'textSecondary'}
              style={styles.dayLabel}>
              {dayLetter(day.date)}
            </ThemedText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.one },
  col: { flex: 1, alignItems: 'center', gap: Spacing.half },
  value: { fontSize: 11 },
  barArea: { height: BAR_AREA, width: '100%', justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: '70%', borderRadius: Spacing.one, minHeight: 0 },
  dayLabel: { fontSize: 12 },
});
