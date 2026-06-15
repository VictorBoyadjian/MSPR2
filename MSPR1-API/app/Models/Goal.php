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
        'label',
        'created_at',
        'updated_at'
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

        public function sportSessions() : BelongsToMany
    {
        return $this->belongsToMany(SportSession::class, 'session_goals');
    }
}
