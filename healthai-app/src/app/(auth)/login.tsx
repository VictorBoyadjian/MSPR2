import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/services/api';
import { isValidEmail, isNotEmpty } from '@/utils/validators';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!isValidEmail(email) || !isNotEmpty(password)) {
      setError('Email ou mot de passe invalide.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      setError(e instanceof ApiError ? 'Identifiants incorrects.' : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.form}>
          <ThemedText type="title">Connexion</ThemedText>
          <ThemedText themeColor="textSecondary">Content de vous revoir</ThemedText>

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="vous@exemple.com"
          />
          <Input
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />

          {error ? (
            <ThemedText type="small" style={styles.error}>
              {error}
            </ThemedText>
          ) : null}

          <Button label="Se connecter" onPress={onSubmit} loading={loading} />

          <Link href="/(auth)/register" style={styles.link}>
            <ThemedText type="linkPrimary">Pas encore de compte ? S&apos;inscrire</ThemedText>
          </Link>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1, justifyContent: 'center' },
  form: { paddingHorizontal: Spacing.four, gap: Spacing.three },
  error: { color: '#e5484d' },
  link: { textAlign: 'center', marginTop: Spacing.two },
});
