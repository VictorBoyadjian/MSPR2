import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Icon from '@/components/ui/Icon';
import Input from '@/components/ui/Input';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { FoodItem } from '@/hooks/useAddMealForm';

/** Quantités usuelles proposées en un tap pour accélérer la saisie. */
const QUICK_QUANTITIES = [50, 100, 150, 200];

type Props = {
  food: FoodItem;
  index: number;
  canRemove: boolean;
  autoFocus?: boolean;
  onChange: (key: keyof FoodItem, value: string) => void;
  onRemove: () => void;
};

/** Carte de saisie d'un aliment : nom, quantité et raccourcis de quantité. */
export function FoodItemCard({ food, index, canRemove, autoFocus, onChange, onRemove }: Props) {
  const theme = useTheme();

  return (
    <ThemedView style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      {canRemove ? (
        <View style={styles.header}>
          <Pressable
            onPress={onRemove}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Supprimer l'aliment ${index + 1}`}>
            <Icon name="trash" size={18} color={theme.danger} />
          </Pressable>
        </View>
      ) : null}

      <Input
        label="Nom"
        value={food.name}
        autoFocus={autoFocus}
        onChangeText={(v) => onChange('name', v)}
        placeholder="ex. Blanc de poulet"
      />

      <Input
        label="Quantité (g)"
        value={food.quantity_g}
        onChangeText={(v) => onChange('quantity_g', v)}
        keyboardType="numeric"
        placeholder="100"
      />

      <View style={styles.quickRow}>
        {QUICK_QUANTITIES.map((q) => {
          const active = food.quantity_g === String(q);
          return (
            <Pressable
              key={q}
              onPress={() => onChange('quantity_g', String(q))}
              style={({ pressed }) => [
                styles.quickChip,
                {
                  backgroundColor: active ? theme.accent : theme.backgroundSelected,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}>
              <ThemedText type="small" style={{ color: active ? theme.onAccent : theme.text }}>
                {q} g
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <ThemedText type="small" themeColor="textFaint" style={styles.number}>
        {index + 1}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  number: {
    alignSelf: 'flex-end',
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  quickChip: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
  },
});
