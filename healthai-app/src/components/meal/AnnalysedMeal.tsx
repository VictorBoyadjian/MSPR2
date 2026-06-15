import { ThemedView } from "../themed-view";
import {
  ScrollView,
  View,
  StyleSheet,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from "@/constants/theme";
import { useRouter } from "expo-router";
import { CalculateDishResponse } from "@/types/calculate-dish-response";
import { useTheme } from '@/hooks/use-theme';
import Button from '@/components/ui/Button';

export const AnnalysedMeal = ({ analyzed }: { analyzed: CalculateDishResponse }) => {
  const router = useRouter();
  const theme = useTheme();

  const macros = [
    { label: 'Protéines', value: analyzed.proteins_g },
    { label: 'Glucides', value: analyzed.carbs_g },
    { label: 'Lipides', value: analyzed.fats_g },
    { label: 'Fibres', value: analyzed.fiber_g },
  ];

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.form}>
          <ThemedText type="subtitle">Repas analysé</ThemedText>

          <ThemedView style={[styles.totals, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="smallBold">{analyzed.dish_name}</ThemedText>
            <ThemedText type="title">{Math.round(analyzed.kcal)} kcal</ThemedText>
          </ThemedView>

          <ThemedView style={[styles.foodCard, { backgroundColor: theme.backgroundElement }]}>
            {macros.map((macro) => (
              <View key={macro.label} style={styles.foodHeader}>
                <ThemedText type="small" themeColor="textSecondary">
                  {macro.label}
                </ThemedText>
                <ThemedText type="smallBold">{Math.round(macro.value)} g</ThemedText>
              </View>
            ))}
          </ThemedView>

          <Button label="OK" onPress={() => router.replace('/meals')} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.three },
  form: { padding: Spacing.four, gap: Spacing.three },
  dateField: { width: '50%', alignItems: 'flex-start' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
  },
  foodCard: { padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.two },
  foodHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  remove: { color: '#e5484d' },
  totals: { padding: Spacing.four, borderRadius: Spacing.three, gap: Spacing.one, alignItems: 'center' },
  error: { color: '#e5484d' },
});