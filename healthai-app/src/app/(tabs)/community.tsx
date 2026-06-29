import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PostCard from '@/components/community/PostCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { usePosts } from '@/hooks/usePosts';
import { useTheme } from '@/hooks/use-theme';

export default function CommunityScreen() {
  const { posts, loading, error, refresh, toggleLike } = usePosts();
  const router = useRouter();
  const theme = useTheme();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle">Communauté</ThemedText>
          <ThemedView style={styles.headerActions}>
            <Button
              variant="secondary"
              icon="profile"
              label="Mes posts"
              onPress={() => router.push('/community/mine')}
            />
            <Button icon="add" label="Publier" onPress={() => router.push('/community/new')} />
          </ThemedView>
        </ThemedView>

        {loading && posts.length === 0 ? (
          <Loader />
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PostCard
                post={item}
                onPress={() => router.push(`/community/${item.id}`)}
                onLike={() => toggleLike(item)}
              />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={theme.text} />
            }
            ListEmptyComponent={
              <ThemedText themeColor="textSecondary" style={styles.empty}>
                {error || 'Aucun post pour le moment. Soyez le premier à publier !'}
              </ThemedText>
            }
          />
        )}
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, backgroundColor: 'transparent' },
  list: { gap: Spacing.three, paddingBottom: BottomTabInset + Spacing.four },
  empty: { textAlign: 'center', marginTop: Spacing.six },
});
