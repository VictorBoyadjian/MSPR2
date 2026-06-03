<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Scout\Searchable;
use Lomkit\Access\Controls\HasControl;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasControl, HasRoles, HasApiTokens, Searchable;

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

    public function Sessions(): HasMany
    {
        return $this->hasMany(Session::class);
    }

    public function Metrics(): HasMany
    {
        return $this->hasMany(Metric::class);
    }

    public function MealLogs(): HasMany
    {
        return $this->hasMany(MealLog::class);
    }
}
