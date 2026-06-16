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

    public function sportSessions(): BelongsToMany
    {
        return $this->belongsToMany(SportSession::class, 'user_sessions')
            ->withPivot(['performed_at']);
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
}
