import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import ProfileForm, { ProfileFormValues } from '@/components/profile/ProfileForm';
import ProgramBanner from '@/components/profile/ProgramBanner';
import Loader from '@/components/ui/Loader';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAllergies } from '@/hooks/useAllergies';
import { useGoals } from '@/hooks/useGoals';
import { useHandicaps } from '@/hooks/useHandicaps';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/services/api';
import { userService } from '@/services/userService';
import { GenderEnum } from '@/types/users.type';

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
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { items: allergies, loading: allergiesLoading, error: allergiesError } = useAllergies();
  const { items: handicaps, loading: handicapsLoading, error: handicapsError } = useHandicaps();
  const { items: goals } = useGoals();

  const [values, setValues] = useState<ProfileFormValues>(emptyValues);
  const [gender, setGender] = useState<GenderEnum | null>(null);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedHandicaps, setSelectedHandicaps] = useState<string[]>([]);
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
    setGender(user.gender ?? null);
  }, [user]);

  // Charge les relations actuelles (le endpoint /me ne renvoie pas les relations).
  useEffect(() => {
    if (!user?.id) return;
    userService
      .getWithRelations(user.id)
      .then((u) => {
        setSelectedAllergies(u?.allergies?.map((a) => a.id) ?? []);
        setSelectedHandicaps(u?.handicaps?.map((h) => h.id) ?? []);
      })
      .catch(() => {});
  }, [user?.id]);

  const onChange = useCallback((field: keyof ProfileFormValues, value: string) => {
    setSuccess(false);
    setValues((v) => ({ ...v, [field]: value }));
  }, []);

  const onChangeGender = useCallback((value: GenderEnum) => {
    setSuccess(false);
    setGender(value);
  }, []);

  const onToggleAllergy = useCallback((id: string) => {
    setSuccess(false);
    setSelectedAllergies((ids) => (ids.includes(id) ? ids.filter((a) => a !== id) : [...ids, id]));
  }, []);

  const onToggleHandicap = useCallback((id: string) => {
    setSuccess(false);
    setSelectedHandicaps((ids) => (ids.includes(id) ? ids.filter((h) => h !== id) : [...ids, id]));
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
          gender: gender ?? undefined,
          age: toNum(values.age),
          height_cm: toNum(values.height_cm),
          weight_kg: toNum(values.weight_kg),
          bodyfat: toNum(values.bodyfat),
          sport_per_week: toNum(values.sport_per_week),
          rest_bpm: toNum(values.rest_bpm),
        },
        selectedAllergies,
        selectedHandicaps,
      );
      await refreshUser();
      setSuccess(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  }, [user?.id, values, gender, selectedAllergies, selectedHandicaps, refreshUser]);

  if (!user) return <Loader />;

  const currentGoal = goals.find((g) => g.id === user.goal_id);
  const goalLabel = currentGoal ? (currentGoal.label ?? currentGoal.name) : null;

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <ScreenHeader title="Profil" />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <ThemedText themeColor="textSecondary">Modifie tes informations</ThemedText>

          <ProgramBanner
            label={goalLabel}
            targetWeight={user.target_weight}
            onPress={() => router.push('/program/select')}
          />

          <ProfileForm
            values={values}
            onChange={onChange}
            gender={gender}
            onChangeGender={onChangeGender}
            allergies={allergies}
            selectedAllergies={selectedAllergies}
            onToggleAllergy={onToggleAllergy}
            allergiesLoading={allergiesLoading}
            allergiesError={allergiesError}
            handicaps={handicaps}
            selectedHandicaps={selectedHandicaps}
            onToggleHandicap={onToggleHandicap}
            handicapsLoading={handicapsLoading}
            handicapsError={handicapsError}
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
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  content: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
  },
});
