<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsToMany, HasMany};
use Lomkit\Access\Controls\HasControl;

class Goal extends Model
{
    use HasControl;

    protected $table = "goals";

    protected $fillable = [
        'id',
        'name',
        'created_at',
        'updated_at'
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    public function Sessions(): BelongsToMany
    {
        return $this->belongsToMany(Session::class, 'session_goals');
    }

    public function Users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
