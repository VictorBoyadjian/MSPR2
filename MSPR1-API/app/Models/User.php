<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\{BelongsToMany, HasMany};
use Lomkit\Access\Controls\HasControl;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasControl, HasRoles, HasApiTokens;

    protected $table = "users";

    protected $fillable = [
        'id',
        'email',
        'first_name',
        'last_name',
        'age',
        'gender',
        'weight_kg',
        'height_cm',
        'is_premium',
        'is_active',
        'remember_token',
        'password',
        'bodyfat',
        'rest_bpm',
        'sport_per_week',
        'goal_id',
        'target_weight',
        'weeks_to_goal',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'password' => 'hashed',
        'is_active' => 'boolean',
        'is_premium' => 'boolean'
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'created_at',
        'updated_at'
    ];

    /**
     * Recalcule le poids cible dès que le programme (goal_id) change :
     * target_weight = poids actuel × coefficient du goal. Couvre tous les chemins
     * d'écriture (PATCH /me, register, mutate…) puisque branché sur l'event `saving`.
     */
    protected static function booted(): void
    {
        static::saving(function (User $user) {
            if (! $user->isDirty('goal_id')) {
                return;
            }

            if ($user->goal_id === null) {
                $user->target_weight = null;
                return;
            }

            $pct = Goal::whereKey($user->goal_id)->value('target_weight_pct');
            if ($pct !== null && $user->weight_kg !== null) {
                $user->target_weight = round($user->weight_kg * $pct, 2);
            }
        });
    }

    public function workoutSessions(): BelongsToMany
    {
        return $this->belongsToMany(WorkoutSession::class, 'user_sessions', 'user_id', 'workout_session_id')
            ->using(UserSession::class)
            ->withPivot(['id', 'performed_at']);
    }

    public function metrics(): HasMany
    {
        return $this->hasMany(Metric::class);
    }

    public function allergies(): BelongsToMany
    {
        return $this->belongsToMany(Allergy::class, 'user_allergies');
    }

    public function handicaps(): BelongsToMany
    {
        return $this->belongsToMany(Handicap::class, 'user_handicaps');
    }

    /**
     * Posts rédigés par l'utilisateur.
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    /**
     * Commentaires rédigés par l'utilisateur.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Posts likés par l'utilisateur (pivot user_like_posts).
     */
    public function likedPosts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'user_like_posts', 'user_id', 'post_id');
    }

    /**
     * Commentaires likés par l'utilisateur (pivot user_like_comments).
     */
    public function likedComments(): BelongsToMany
    {
        return $this->belongsToMany(Comment::class, 'user_like_comments', 'user_id', 'comment_id');
    }
}
