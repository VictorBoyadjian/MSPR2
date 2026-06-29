<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Likes du réseau social. Un like n'est PAS une édition du post/commentaire :
 * tout utilisateur connecté peut liker n'importe quel contenu. On ne passe donc
 * pas par la mutation Lomkit (protégée par le contrôle de propriété), mais par
 * ces routes dédiées qui basculent simplement la relation `likers`.
 */
class LikeController
{
    public function togglePost(Request $request, int $id): JsonResponse
    {
        $post = Post::findOrFail($id);

        return $this->toggle($post, $request->user()->id);
    }

    public function toggleComment(Request $request, int $id): JsonResponse
    {
        $comment = Comment::findOrFail($id);

        return $this->toggle($comment, $request->user()->id);
    }

    /**
     * Bascule l'appartenance de l'utilisateur à la relation `likers` du modèle
     * et renvoie l'état à jour (compteur + like de l'utilisateur courant).
     */
    private function toggle(Post|Comment $model, int $userId): JsonResponse
    {
        $result = $model->likers()->toggle($userId);
        $hasLiked = count($result['attached']) > 0;

        return response()->json([
            'data' => [
                'id' => $model->getKey(),
                'likes' => $model->likers()->count(),
                'hasLiked' => $hasLiked,
            ],
        ]);
    }
}
