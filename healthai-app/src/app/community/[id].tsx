import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PostCard from '@/components/community/PostCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Icon from '@/components/ui/Icon';
import Loader from '@/components/ui/Loader';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { commentService, postService } from '@/services/postService';
import { useAuthStore } from '@/stores/authStore';
import { Comment, Post, authorName, contentText } from '@/types/posts.type';
import { formatDateTime } from '@/utils/formatDate';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const confirm = useConfirm();
  const { user } = useAuthStore();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [fetchedPost, fetchedComments] = await Promise.all([
        postService.getById(id),
        commentService.list(id),
      ]);
      setPost(fetchedPost ?? null);
      setComments(fetchedComments);
    } catch (err) {
      console.error('PostDetail.load error:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const likePost = async () => {
    if (!post || !user?.id) return;
    setPost({ ...post, hasLiked: !post.hasLiked, likes: post.likes + (post.hasLiked ? -1 : 1) });
    try {
      const { data } = await postService.toggleLike(post.id);
      setPost((prev) => (prev ? { ...prev, hasLiked: data.hasLiked, likes: data.likes } : prev));
    } catch {
      load();
    }
  };

  const likeComment = async (comment: Comment) => {
    if (!user?.id) return;
    setComments((prev) =>
      prev.map((c) =>
        c.id === comment.id
          ? { ...c, hasLiked: !c.hasLiked, likes: c.likes + (c.hasLiked ? -1 : 1) }
          : c,
      ),
    );
    try {
      const { data } = await commentService.toggleLike(comment.id);
      setComments((prev) =>
        prev.map((c) => (c.id === comment.id ? { ...c, hasLiked: data.hasLiked, likes: data.likes } : c)),
      );
    } catch {
      load();
    }
  };

  const sendComment = async () => {
    if (!post || !user?.id || !draft.trim()) return;
    setSending(true);
    try {
      await commentService.create(post.id, user.id, draft.trim());
      setDraft('');
      setComments(await commentService.list(post.id));
    } catch (err) {
      console.error('PostDetail.sendComment error:', err);
    } finally {
      setSending(false);
    }
  };

  const deletePost = async () => {
    if (!post) return;
    const ok = await confirm({
      title: 'Supprimer le post',
      message: 'Cette action est définitive.',
      confirmLabel: 'Supprimer',
      destructive: true,
    });
    if (!ok) return;
    try {
      await postService.remove(post.id);
      router.back();
    } catch (err) {
      console.error('PostDetail.deletePost error:', err);
    }
  };

  const isAuthor = !!post && !!user?.id && post.user_id === user.id;

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <ScreenHeader title="Post" />
          </View>
          {isAuthor ? (
            <Pressable onPress={deletePost} hitSlop={8} style={styles.deleteBtn}>
              <Icon name="trash" size={20} color={theme.danger} />
            </Pressable>
          ) : null}
        </View>

        {loading && !post ? (
          <Loader />
        ) : !post ? (
          <ThemedText themeColor="textSecondary" style={styles.empty}>
            Post introuvable.
          </ThemedText>
        ) : (
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <PostCard post={post} onLike={likePost} showComments={false} />

              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.commentsTitle}>
                {comments.length} commentaire{comments.length > 1 ? 's' : ''}
              </ThemedText>

              {comments.map((comment) => (
                <CommentRow key={comment.id} comment={comment} onLike={() => likeComment(comment)} />
              ))}
            </ScrollView>

            <View style={[styles.composer, { borderTopColor: theme.backgroundSelected }]}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Ajouter un commentaire…"
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.composerInput,
                  { color: theme.text, backgroundColor: theme.backgroundElement },
                ]}
              />
              <Pressable
                onPress={sendComment}
                disabled={sending || !draft.trim()}
                hitSlop={8}
                style={[styles.sendBtn, { backgroundColor: theme.accent, opacity: sending || !draft.trim() ? 0.5 : 1 }]}>
                <Icon name="send" size={18} color={theme.onAccent} />
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function CommentRow({ comment, onLike }: { comment: Comment; onLike: () => void }) {
  const theme = useTheme();
  return (
    <ThemedView type="backgroundElement" style={styles.comment}>
      <View style={styles.commentHeader}>
        <ThemedText type="smallBold">{authorName(comment.user)}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {formatDateTime(comment.created_at)}
        </ThemedText>
      </View>
      <ThemedText type="small">{contentText(comment.content)}</ThemedText>
      <Pressable onPress={onLike} hitSlop={8} style={styles.commentLike}>
        <Icon
          name={comment.hasLiked ? 'like-filled' : 'like'}
          size={16}
          color={comment.hasLiked ? theme.danger : theme.textSecondary}
        />
        <ThemedText type="small" themeColor="textSecondary">
          {comment.likes}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerLeft: { flex: 1 },
  deleteBtn: { paddingHorizontal: Spacing.four },
  content: { padding: Spacing.four, gap: Spacing.three },
  commentsTitle: { marginTop: Spacing.two },
  comment: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'transparent' },
  commentLike: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, marginTop: Spacing.half },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  composerInput: {
    flex: 1,
    height: 44,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { textAlign: 'center', marginTop: Spacing.six },
});
