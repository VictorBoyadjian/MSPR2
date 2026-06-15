import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Allergy } from '@/types/allergies.type';
import { Handicap } from '@/types/handicaps.type';

export type ProfileFormValues = {
  first_name: string;
  last_name: string;
  age: string;
  height_cm: string;
  weight_kg: string;
  bodyfat: string;
  sport_per_week: string;
  rest_bpm: string;
};

type Props = {
  values: ProfileFormValues;
  onChange: (field: keyof ProfileFormValues, value: string) => void;
  allergies: Allergy[];
  selectedAllergies: string[];
  onToggleAllergy: (id: string) => void;
  allergiesLoading: boolean;
  allergiesError: string;
  handicaps: Handicap[];
  selectedHandicaps: string[];
  onToggleHandicap: (id: string) => void;
  handicapsLoading: boolean;
  handicapsError: string;
  onSave: () => void;
  saving: boolean;
  error?: string;
  success?: boolean;
};

export default function ProfileForm({
  values,
  onChange,
  allergies,
  selectedAllergies,
  onToggleAllergy,
  allergiesLoading,
  allergiesError,
  handicaps,
  selectedHandicaps,
  onToggleHandicap,
  handicapsLoading,
  handicapsError,
  onSave,
  saving,
  error,
  success,
}: Props) {
  return (
    <View style={styles.form}>
      <Section title="Identité">
        <Input label="Prénom" value={values.first_name} onChangeText={(v) => onChange('first_name', v)} />
        <Input label="Nom" value={values.last_name} onChangeText={(v) => onChange('last_name', v)} />
      </Section>

      <Section title="Mensurations">
        <Input label="Âge" value={values.age} onChangeText={(v) => onChange('age', v)} keyboardType="number-pad" />
        <Input label="Taille (cm)" value={values.height_cm} onChangeText={(v) => onChange('height_cm', v)} keyboardType="decimal-pad" />
        <Input label="Poids (kg)" value={values.weight_kg} onChangeText={(v) => onChange('weight_kg', v)} keyboardType="decimal-pad" />
        <Input label="Masse grasse (%)" value={values.bodyfat} onChangeText={(v) => onChange('bodyfat', v)} keyboardType="decimal-pad" />
      </Section>

      <Section title="Activité">
        <Input label="Sport (h / semaine)" value={values.sport_per_week} onChangeText={(v) => onChange('sport_per_week', v)} keyboardType="decimal-pad" />
        <Input label="BPM au repos" value={values.rest_bpm} onChangeText={(v) => onChange('rest_bpm', v)} keyboardType="number-pad" />
      </Section>

      <Section title="Allergies">
        {allergiesLoading ? (
          <ActivityIndicator />
        ) : allergiesError ? (
          <ThemedText type="small" themeColor="textSecondary">{allergiesError}</ThemedText>
        ) : allergies.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary">Aucune allergie disponible.</ThemedText>
        ) : (
          <View style={styles.chips}>
            {allergies.map((allergy) => (
              <Chip
                key={allergy.id}
                label={allergy.label ?? allergy.name ?? 'Sans nom'}
                selected={selectedAllergies.includes(allergy.id)}
                onPress={() => onToggleAllergy(allergy.id)}
              />
            ))}
          </View>
        )}
      </Section>

      <Section title="Handicaps">
        {handicapsLoading ? (
          <ActivityIndicator />
        ) : handicapsError ? (
          <ThemedText type="small" themeColor="textSecondary">{handicapsError}</ThemedText>
        ) : handicaps.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary">Aucun handicap disponible.</ThemedText>
        ) : (
          <View style={styles.chips}>
            {handicaps.map((handicap) => (
              <Chip
                key={handicap.id}
                label={handicap.label ?? handicap.name ?? 'Sans nom'}
                selected={selectedHandicaps.includes(handicap.id)}
                onPress={() => onToggleHandicap(handicap.id)}
              />
            ))}
          </View>
        )}
      </Section>

      {error ? (
        <ThemedText type="small" style={styles.error}>{error}</ThemedText>
      ) : success ? (
        <ThemedText type="small" style={styles.success}>Profil mis à jour.</ThemedText>
      ) : null}

      <Button label="Enregistrer" onPress={onSave} loading={saving} />
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <ThemedView style={styles.section}>
      <ThemedText type="smallBold" themeColor="textSecondary">{title.toUpperCase()}</ThemedText>
      {children}
    </ThemedView>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: selected ? theme.text : theme.backgroundElement, opacity: pressed ? 0.7 : 1 },
      ]}>
      <ThemedText type="small" style={{ color: selected ? theme.background : theme.text, fontWeight: selected ? '700' : '500' }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.four },
  section: { gap: Spacing.two },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.one },
  chip: { paddingVertical: Spacing.two, paddingHorizontal: Spacing.three, borderRadius: 999 },
  error: { color: '#e5484d' },
  success: { color: '#30a46c' },
});
