<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Lomkit\Access\Controls\HasControl;

class SportSession extends Model
{
    use HasControl;

    protected $table = "sport_sessions";

    protected $fillable = [
        'id',
        'duration_min',
        'created_at',
        'updated_at'
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    public function exercises() : BelongsToMany
    {
        return $this->belongsToMany(Exercise::class, 'sessions_exercises')
            ->withPivot(['reps', 'sets', 'duration_min']);
    }

    public function users() : BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_sessions')
            ->withPivot(['performed_at']);
    }

    public function goals() : BelongsToMany
    {
        return $this->belongsToMany(User::class, 'session_goals');
    }
}
