import { useCallback, useEffect, useState } from 'react';

import { postService } from '@/services/postService';
import { Post } from '@/types/posts.type';
import { useAuthStore } from '@/stores/authStore';

export function usePosts() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setPosts(await postService.listFeed());
    } catch (err) {
      console.error('usePosts.refresh error:', err);
      setError('Impossible de charger le fil.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /** Like optimiste : on bascule localement, puis on resynchronise en cas d'échec. */
  const toggleLike = useCallback(
    async (post: Post) => {
      if (!user?.id) return;
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, hasLiked: !p.hasLiked, likes: p.likes + (p.hasLiked ? -1 : 1) }
            : p,
        ),
      );
      try {
        const { data } = await postService.toggleLike(post.id);
        // Réconcilie avec l'état serveur (compteur exact).
        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id ? { ...p, hasLiked: data.hasLiked, likes: data.likes } : p,
          ),
        );
      } catch (err) {
        console.error('usePosts.toggleLike error:', err);
        refresh();
      }
    },
    [user?.id, refresh],
  );

  return { posts, loading, error, refresh, toggleLike };
}
