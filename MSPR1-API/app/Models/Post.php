<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, BelongsToMany, HasMany, MorphMany};
use Illuminate\Support\Facades\Auth;
use Lomkit\Access\Controls\HasControl;
use Override;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Post extends Model implements HasMedia
{
    use HasControl, InteractsWithMedia;

    protected $table = "posts";

    protected $fillable = [
        'id',
        'content',
        'user_id',
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

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function likers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_like_posts', 'post_id', 'user_id');
    }

    public function getLikesAttribute() : int
    {
        return $this->likers()->count();
    }

    public function medias(): MorphMany
    {
        return $this->morphMany(Media::class, 'model');
    }

    #[Override]
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('post_media');
    }

    public function getHasLikedAttribute() : bool
    {
        return $this->likers()->where('user_id', Auth::user()?->id)->exists();
    }
}
