import { Platform } from 'react-native';

import {
  comments,
  MutateResponse,
  posts,
  sendMultipart,
  sendRequest,
} from '@/services/api';
import { Comment, Post } from '@/types/posts.type';

/** État renvoyé par les routes de like dédiées. */
export type LikeState = { data: { id: string; likes: number; hasLiked: boolean } };

export type CreatePostInput = {
  text: string;
  userId: string;
  /** URI locale de l'image à joindre (optionnelle). */
  imageUri?: string | null;
  imageName?: string;
  imageType?: string;
};

export const postService = {
  /** Fil global : tous les posts, du plus récent au plus ancien. */
  listFeed: async (): Promise<Post[]> => {
    const response = await posts.search({
      includes: [{ relation: 'user' }, { relation: 'medias' }],
      sorts: [{ field: 'id', direction: 'desc' }],
      limit: 50,
    });
    return response.data;
  },

  getById: async (id: string): Promise<Post | undefined> => {
    const response = await posts.search({
      filters: [{ field: 'id', operator: 'like', value: id }],
      includes: [{ relation: 'user' }, { relation: 'medias' }],
    });
    return response.data[0];
  },

  /** Mes posts : ceux de l'utilisateur, avec médias et commentaires (pour les compteurs). */
  listMine: async (userId: string): Promise<Post[]> => {
    const response = await posts.search({
      filters: [{ field: 'user_id', operator: 'like', value: userId }],
      includes: [{ relation: 'medias' }, { relation: 'comments' }],
      sorts: [{ field: 'id', direction: 'desc' }],
      limit: 50,
    });
    return response.data;
  },

  /**
   * Crée un post. Avec une image, on envoie en multipart : le backend (hook
   * `mutated` de PostResource) lit la clé racine `medias` et l'ajoute à la
   * collection `post_media`. Sans image, simple mutation JSON.
   */
  create: async ({ text, userId, imageUri, imageName, imageType }: CreatePostInput): Promise<MutateResponse> => {
    if (imageUri) {
      const form = new FormData();
      form.append('mutate[0][operation]', 'create');
      form.append('mutate[0][attributes][content][text]', text);
      form.append('mutate[0][attributes][user_id]', String(userId));
      form.append('medias[0][collection]', 'post_media');

      const name = imageName ?? `post_${Date.now()}.jpg`;
      const type = imageType ?? 'image/jpeg';
      if (Platform.OS === 'web') {
        // Sur le web, FormData exige un vrai Blob/File : on récupère le binaire
        // depuis l'URI (data: ou blob:) — sinon l'objet est sérialisé en
        // "[object Object]" et le backend ne reçoit aucun fichier.
        const blob = await fetch(imageUri).then((response) => response.blob());
        form.append('medias[0][file]', blob, name);
      } else {
        form.append('medias[0][file]', { uri: imageUri, name, type } as unknown as Blob);
      }
      return sendMultipart<MutateResponse>('/posts/mutate', form);
    }

    return posts.mutate([
      { operation: 'create', attributes: { content: { text }, user_id: userId } },
    ]);
  },

  /**
   * Like / unlike via la route dédiée (n'importe quel utilisateur connecté peut
   * liker, contrairement à la mutation Lomkit limitée au propriétaire du post).
   */
  toggleLike: (postId: string): Promise<LikeState> =>
    sendRequest<LikeState>('POST', `/posts/${postId}/like`),

  /** Modifie le texte d'un post (réservé à l'auteur côté API). */
  update: (postId: string, text: string): Promise<MutateResponse> =>
    posts.mutate([{ operation: 'update', key: postId, attributes: { content: { text } } }]),

  remove: (id: string) => posts.delete([id]),
};

export const commentService = {
  /** Commentaires d'un post, du plus ancien au plus récent. */
  list: async (postId: string): Promise<Comment[]> => {
    const response = await comments.search({
      filters: [{ field: 'post_id', operator: 'like', value: postId }],
      includes: [{ relation: 'user' }],
      sorts: [{ field: 'id', direction: 'asc' }],
      limit: 50,
    });
    return response.data;
  },

  create: (postId: string, userId: string, text: string): Promise<MutateResponse> =>
    comments.mutate([
      {
        operation: 'create',
        attributes: { content: { text }, user_id: userId, post_id: postId },
      },
    ]),

  toggleLike: (commentId: string): Promise<LikeState> =>
    sendRequest<LikeState>('POST', `/comments/${commentId}/like`),

  remove: (id: string) => comments.delete([id]),
};
