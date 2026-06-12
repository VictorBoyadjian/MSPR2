import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/services/api';
import { isValidEmail, isValidPassword, isNotEmpty } from '@/utils/validators';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!isNotEmpty(firstName) || !isNotEmpty(lastName)) {
      setError('Indiquez votre prénom et votre nom.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Email invalide.');
      return;
    }
    if (!isValidPassword(password)) {
      setError('Le mot de passe doit faire au moins 8 caractères.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}>
          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
            <ThemedText type="title">Inscription</ThemedText>
            <ThemedText themeColor="textSecondary">Créez votre compte HealthAI</ThemedText>

            <Input label="Prénom" value={firstName} onChangeText={setFirstName} />
            <Input label="Nom" value={lastName} onChangeText={setLastName} />
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Input
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {error ? (
              <ThemedText type="small" style={styles.error}>
                {error}
              </ThemedText>
            ) : null}

            <Button label="S'inscrire" onPress={onSubmit} loading={loading} />

            <Link href="/(auth)/login" style={styles.link}>
              <ThemedText type="linkPrimary">Déjà un compte ? Se connecter</ThemedText>
            </Link>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  form: { padding: Spacing.four, gap: Spacing.three, flexGrow: 1, justifyContent: 'center' },
  error: { color: '#e5484d' },
  link: { textAlign: 'center', marginTop: Spacing.two },
});
