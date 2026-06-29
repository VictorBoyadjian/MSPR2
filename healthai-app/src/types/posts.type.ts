import { User } from '@/types/users.type';

/** Fichier attaché à un post (Spatie Media Library, collection `post_media`). */
export type PostMedia = {
  id: string;
  collection_name: string;
  name: string;
  file_name: string;
  mime_type: string;
  original_url: string;
  preview_url: string;
  order_column: number;
};

/** Contenu d'un post / commentaire : JSON libre côté API ({ text } ou chaîne). */
export type PostContent = { text?: string } | string | null;

export type Post = {
  id: string;
  content: PostContent;
  user_id: string;
  /** Nombre de likes (calculé côté API). */
  likes: number;
  /** L'utilisateur courant a-t-il liké (calculé côté API). */
  hasLiked: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
  medias?: PostMedia[];
  comments?: Comment[];
};

export type Comment = {
  id: string;
  content: PostContent;
  user_id: string;
  post_id: string;
  likes: number;
  hasLiked: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
};

/** Extrait le texte affichable d'un contenu de post/commentaire. */
export function contentText(content: PostContent): string {
  if (!content) return '';
  if (typeof content === 'string') return content;
  return content.text ?? '';
}

/** Nom affichable de l'auteur d'un post / commentaire. */
export function authorName(user?: User): string {
  if (!user) return 'Utilisateur';
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return name || user.email || 'Utilisateur';
}
