import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Post, authorName, contentText } from '@/types/posts.type';
import { formatDateTime } from '@/utils/formatDate';

type Props = {
  post: Post;
  onPress?: () => void;
  onLike?: () => void;
  /** Affiche le compteur de commentaires (sur l'écran de détail on le masque). */
  showComments?: boolean;
};

export default function PostCard({ post, onPress, onLike, showComments = true }: Props) {
  const theme = useTheme();
  const image = post.medias?.[0]?.original_url;
  const text = contentText(post.content);

  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => pressed && onPress ? styles.pressed : undefined}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: theme.backgroundSelected }]}>
            <Icon name="profile-filled" size={18} color={theme.textSecondary} />
          </View>
          <View style={styles.headerText}>
            <ThemedText type="smallBold">{authorName(post.user)}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {formatDateTime(post.created_at)}
            </ThemedText>
          </View>
        </View>

        {text ? <ThemedText style={styles.body}>{text}</ThemedText> : null}

        {image ? (
          <Image source={{ uri: image }} style={styles.image} contentFit="cover" transition={150} />
        ) : null}

        <View style={styles.actions}>
          <Pressable
            onPress={onLike}
            disabled={!onLike}
            hitSlop={8}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
            <Icon
              name={post.hasLiked ? 'like-filled' : 'like'}
              size={20}
              color={post.hasLiked ? theme.danger : theme.textSecondary}
            />
            <ThemedText type="small" themeColor="textSecondary">
              {post.likes}
            </ThemedText>
          </Pressable>

          {showComments ? (
            <View style={styles.action}>
              <Icon name="comment" size={20} color={theme.textSecondary} />
              <ThemedText type="small" themeColor="textSecondary">
                Commenter
              </ThemedText>
            </View>
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.two },
  pressed: { opacity: 0.7 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, backgroundColor: 'transparent' },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { gap: 0 },
  body: { marginTop: Spacing.half },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: Spacing.two,
    marginTop: Spacing.half,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.four,
    marginTop: Spacing.one,
  },
  action: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
});
