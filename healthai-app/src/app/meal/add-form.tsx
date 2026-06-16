import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnnalysedMeal } from '@/components/meal/AnnalysedMeal';
import { FoodItemCard, MealTypeSelector } from '@/components/meal/add';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import DateTimeField from '@/components/ui/DateTimeField';
import Icon from '@/components/ui/Icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAddMealForm } from '@/hooks/useAddMealForm';

export default function AddMealScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { aliments } = useLocalSearchParams<{ aliments?: string }>();

  const {
    foods,
    mealType,
    eatedAt,
    error,
    phase,
    analyzed,
    focusedId,
    namedCount,
    canSubmit,
    setMealType,
    setEatedAt,
    updateFood,
    removeFood,
    addFood,
    submit,
  } = useAddMealForm({ aliments });

  // --- Analyse nutritionnelle en cours ---
  if (phase === 'loading') {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={theme.accent} />
        <ThemedText type="small" themeColor="textSecondary">
          Analyse de votre repas…
        </ThemedText>
      </ThemedView>
    );
  }

  // --- Récapitulatif du repas analysé ---
  if (phase === 'result' && analyzed) {
    return <AnnalysedMeal analyzed={analyzed} />;
  }

  // --- Saisie du repas ---
  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* En-tête : titre + fermeture */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <ThemedText type="subtitle">Mon repas</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Listez vos aliments, on calcule les calories.
            </ThemedText>
          </View>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Fermer"
            style={[styles.closeBtn, { backgroundColor: theme.backgroundElement }]}>
            <Icon name="close" size={20} color={theme.text} />
          </Pressable>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}>
          <ScrollView
            contentContainerStyle={styles.form}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {/* Quand & quel repas */}
            <View style={styles.section}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                Type de repas
              </ThemedText>
              <MealTypeSelector value={mealType} onChange={setMealType} />
            </View>

            <View style={styles.section}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                Date & heure
              </ThemedText>
              <View style={styles.dateField}>
                <DateTimeField value={eatedAt} onChange={setEatedAt} mode="datetime" />
              </View>
            </View>

            {/* Aliments */}
            <View style={styles.section}>
              <View style={styles.foodsHeader}>
                <ThemedText type="smallBold" themeColor="textSecondary">
                  Aliments
                </ThemedText>
                <ThemedText type="small" themeColor="textFaint">
                  {namedCount} ajouté{namedCount > 1 ? 's' : ''}
                </ThemedText>
              </View>

              {foods.map((food, index) => (
                <FoodItemCard
                  key={food.id}
                  food={food}
                  index={index}
                  canRemove={foods.length > 1}
                  autoFocus={food.id === focusedId}
                  onChange={(key, value) => updateFood(food.id, key, value)}
                  onRemove={() => removeFood(food.id)}
                />
              ))}

              <Button label="Ajouter un aliment" variant="secondary" icon="add" onPress={addFood} />
            </View>

            {error ? (
              <ThemedText type="small" style={{ color: theme.danger }}>
                {error}
              </ThemedText>
            ) : null}
          </ScrollView>

          {/* Footer fixe : CTA principal */}
          <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
            <Button
              label={canSubmit ? `Enregistrer (${namedCount})` : 'Enregistrer'}
              onPress={submit}
              disabled={!canSubmit}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.three },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    gap: Spacing.three,
  },
  headerText: { flex: 1, gap: Spacing.one },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: { padding: Spacing.four, paddingTop: Spacing.two, gap: Spacing.four },
  section: { gap: Spacing.two },
  dateField: { alignItems: 'flex-start' },
  foodsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footer: {
    padding: Spacing.four,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
