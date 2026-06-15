import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import ProfileForm, { ProfileFormValues } from '@/components/profile/ProfileForm';
import Loader from '@/components/ui/Loader';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAllergies } from '@/hooks/useAllergies';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/services/api';
import { userService } from '@/services/userService';

const toStr = (n: number | null | undefined) => (n == null ? '' : String(n));
const toNum = (s: string) => {
  const n = parseFloat(s.replace(',', '.'));
  return Number.isNaN(n) ? undefined : n;
};

const emptyValues: ProfileFormValues = {
  first_name: '',
  last_name: '',
  age: '',
  height_cm: '',
  weight_kg: '',
  bodyfat: '',
  sport_per_week: '',
  rest_bpm: '',
};

export default function ProfileScreen() {
  const { user, refreshUser } = useAuth();
  const { items: allergies, loading: allergiesLoading, error: allergiesError } = useAllergies();

  const [values, setValues] = useState<ProfileFormValues>(emptyValues);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Initialise le formulaire à partir de l'utilisateur courant.
  useEffect(() => {
    if (!user) return;
    setValues({
      first_name: user.first_name ?? '',
      last_name: user.last_name ?? '',
      age: toStr(user.age),
      height_cm: toStr(user.height_cm),
      weight_kg: toStr(user.weight_kg),
      bodyfat: toStr(user.bodyfat),
      sport_per_week: toStr(user.sport_per_week),
      rest_bpm: toStr(user.rest_bpm),
    });
  }, [user]);

  // Charge les allergies actuelles (le endpoint /me ne renvoie pas les relations).
  useEffect(() => {
    if (!user?.id) return;
    userService
      .getWithAllergies(user.id)
      .then((u) => setSelectedAllergies(u?.allergies?.map((a) => a.id) ?? []))
      .catch(() => {});
  }, [user?.id]);

  const onChange = useCallback((field: keyof ProfileFormValues, value: string) => {
    setSuccess(false);
    setValues((v) => ({ ...v, [field]: value }));
  }, []);

  const onToggleAllergy = useCallback((id: string) => {
    setSuccess(false);
    setSelectedAllergies((ids) => (ids.includes(id) ? ids.filter((a) => a !== id) : [...ids, id]));
  }, []);

  const onSave = useCallback(async () => {
    if (!user?.id) return;
    setError('');
    setSuccess(false);
    setSaving(true);
    try {
      await userService.update(
        {
          first_name: values.first_name.trim(),
          last_name: values.last_name.trim(),
          age: toNum(values.age),
          height_cm: toNum(values.height_cm),
          weight_kg: toNum(values.weight_kg),
          bodyfat: toNum(values.bodyfat),
          sport_per_week: toNum(values.sport_per_week),
          rest_bpm: toNum(values.rest_bpm),
        },
        selectedAllergies,
      );
      await refreshUser();
      setSuccess(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  }, [user?.id, values, selectedAllergies, refreshUser]);

  if (!user) return <Loader />;

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle">Profil</ThemedText>
          <ThemedText themeColor="textSecondary">Modifie tes informations</ThemedText>
        </ThemedView>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <ProfileForm
            values={values}
            onChange={onChange}
            allergies={allergies}
            selectedAllergies={selectedAllergies}
            onToggleAllergy={onToggleAllergy}
            allergiesLoading={allergiesLoading}
            allergiesError={allergiesError}
            onSave={onSave}
            saving={saving}
            error={error}
            success={success}
          />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  header: { gap: Spacing.one, marginBottom: Spacing.four },
  content: { gap: Spacing.three, paddingBottom: BottomTabInset + Spacing.four },
});
