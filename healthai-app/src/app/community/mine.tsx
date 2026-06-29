import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Loader from '@/components/ui/Loader';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { postService } from '@/services/postService';
import { useAuthStore } from '@/stores/authStore';
import { Post, contentText } from '@/types/posts.type';

export default function MyPostsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const confirm = useConfirm();
  const { user } = useAuthStore();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      setPosts(await postService.listMine(user.id));
    } catch (err) {
      console.error('MyPosts.load error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const remove = async (post: Post) => {
    const ok = await confirm({
      title: 'Supprimer le post',
      message: 'Cette action est définitive.',
      confirmLabel: 'Supprimer',
      destructive: true,
    });
    if (!ok) return;
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
    try {
      await postService.remove(post.id);
    } catch (err) {
      console.error('MyPosts.remove error:', err);
      load();
    }
  };

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <ScreenHeader title="Mes posts" />

        {loading && posts.length === 0 ? (
          <Loader />
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MyPostRow
                post={item}
                onOpen={() => router.push(`/community/${item.id}`)}
                onEdit={() => router.push(`/community/new?id=${item.id}`)}
                onDelete={() => remove(item)}
              />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <ThemedText themeColor="textSecondary" style={styles.empty}>
                Vous n&apos;avez publié aucun post.
              </ThemedText>
            }
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function MyPostRow({
  post,
  onOpen,
  onEdit,
  onDelete,
}: {
  post: Post;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const theme = useTheme();
  const image = post.medias?.[0]?.original_url;
  const text = contentText(post.content);

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <Pressable onPress={onOpen} style={styles.cardMain}>
        {image ? (
          <Image source={{ uri: image }} style={styles.thumb} contentFit="cover" />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder, { backgroundColor: theme.backgroundSelected }]}>
            <Icon name="image" size={20} color={theme.textSecondary} />
          </View>
        )}
        <View style={styles.cardBody}>
          <ThemedText numberOfLines={2}>{text || 'Sans texte'}</ThemedText>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Icon name="like" size={16} color={theme.textSecondary} />
              <ThemedText type="small" themeColor="textSecondary">
                {post.likes}
              </ThemedText>
            </View>
            <View style={styles.stat}>
              <Icon name="comment" size={16} color={theme.textSecondary} />
              <ThemedText type="small" themeColor="textSecondary">
                {post.comments?.length ?? 0}
              </ThemedText>
            </View>
          </View>
        </View>
      </Pressable>

      <View style={styles.actions}>
        <Button variant="secondary" icon="edit" label="Modifier" onPress={onEdit} />
        <Pressable
          onPress={onDelete}
          hitSlop={8}
          style={({ pressed }) => [
            styles.deleteBtn,
            { backgroundColor: theme.backgroundSelected, opacity: pressed ? 0.7 : 1 },
          ]}>
          <Icon name="trash" size={18} color={theme.danger} />
        </Pressable>
      </View>
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
  list: { padding: Spacing.four, gap: Spacing.three },
  empty: { textAlign: 'center', marginTop: Spacing.six },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  cardMain: { flexDirection: 'row', gap: Spacing.three, backgroundColor: 'transparent' },
  thumb: { width: 64, height: 64, borderRadius: Spacing.two },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, gap: Spacing.two },
  stats: { flexDirection: 'row', gap: Spacing.four },
  stat: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  actions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, backgroundColor: 'transparent' },
  deleteBtn: {
    width: 44,
    height: 44,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
