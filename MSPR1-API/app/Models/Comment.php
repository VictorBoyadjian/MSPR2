<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, BelongsToMany};
use Illuminate\Support\Facades\Auth;
use Lomkit\Access\Controls\HasControl;

class Comment extends Model
{
    use HasControl;

    protected $table = "comments";

    protected $fillable = [
        'id',
        'content',
        'user_id',
        'post_id',
        'created_at',
        'updated_at',
    ];

    protected $appends = [
        'likes',
        'hasLiked'

    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    public function likers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_like_comments', 'comment_id', 'user_id');
    }

    public function getLikesAttribute() : int
    {
        return $this->likers()->count();
    }

    public function getHasLikedAttribute() : bool
    {
        return $this->likers()->where('user_id', Auth::user()?->id)->exists();
    }
}
