import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import Icon from '@/components/ui/Icon';
import { SessionResultRow } from '@/components/workout/SessionResultRow';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { sessionService } from '@/services/sessionService';
import { WorkoutSession } from '@/types/workout-sessions.type';

type Props = {
  /** Profil (goal) : les séances de ce programme sont remontées en premier. */
  profile?: string | null;
  onSelect: (session: WorkoutSession) => void;
  autoFocus?: boolean;
};

/**
 * Recherche de séances sur tout le catalogue (champ avec icône, résultats en
 * temps réel) en mettant en avant les séances recommandées pour le profil.
 */
export function SessionSearch({ profile, onSelect, autoFocus }: Props) {
  const theme = useTheme();
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<WorkoutSession[]>([]);
  const [searching, setSearching] = useState(true);

  // Recherche à la frappe : 350 ms de répit avant l'appel (immédiat si vide).
  useEffect(() => {
    let active = true;
    const handle = setTimeout(
      async () => {
        if (active) setSearching(true);
        try {
          const list = await sessionService.search(term);
          if (active) setResults(list);
        } catch {
          if (active) setResults([]);
        } finally {
          if (active) setSearching(false);
        }
      },
      term.trim() ? 350 : 0,
    );
    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [term]);

  // Recommandées (séances du programme) d'abord, puis le reste du catalogue.
  const recommended = profile ? results.filter((s) => s.profile === profile) : [];
  const others = recommended.length ? results.filter((s) => s.profile !== profile) : results;

  const renderRows = (sessions: WorkoutSession[]) =>
    sessions.map((session) => (
      <SessionResultRow key={session.id} session={session} onPress={() => onSelect(session)} />
    ));

  return (
    <View style={styles.container}>
      <View style={[styles.field, { backgroundColor: theme.backgroundElement }]}>
        <Icon name="search" size={18} color={theme.textSecondary} />
        <TextInput
          value={term}
          onChangeText={setTerm}
          autoFocus={autoFocus}
          placeholder="Rechercher une séance"
          placeholderTextColor={theme.textSecondary}
          returnKeyType="search"
          style={[styles.input, { color: theme.text }]}
        />
        {searching ? (
          <ActivityIndicator size="small" color={theme.textSecondary} />
        ) : term ? (
          <Pressable onPress={() => setTerm('')} hitSlop={8} accessibilityLabel="Effacer">
            <Icon name="close" size={18} color={theme.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      {recommended.length ? (
        <View style={styles.group}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Recommandées pour vous
          </ThemedText>
          {renderRows(recommended)}
        </View>
      ) : null}

      {others.length ? (
        <View style={styles.group}>
          {recommended.length ? (
            <ThemedText type="smallBold" themeColor="textSecondary">
              Autres séances
            </ThemedText>
          ) : null}
          {renderRows(others)}
        </View>
      ) : null}

      {!searching && results.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
          Aucune séance trouvée{term ? ` pour « ${term} »` : ''}.
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.three },
  group: { gap: Spacing.two },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  empty: { paddingVertical: Spacing.two },
});
