<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Lomkit\Access\Controls\HasControl;

class WorkoutSession extends Model
{
    use HasControl;

    protected $table = "workout_sessions";

    public $timestamps = false;

    protected $fillable = [
        'id',
        'name',
        'profile',
        'session_type',
        'total_duration_min',
        'difficulty',
        'description',
        'objective',
        'created_at',
    ];

    public function exercises(): BelongsToMany
    {
        return $this->belongsToMany(WorkoutExercise::class, 'session_exercises', 'session_id', 'exercise_id')
            ->withPivot(['order_num', 'sets', 'reps', 'rest_sec', 'notes'])
            ->orderByPivot('order_num');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_sessions', 'workout_session_id', 'user_id')
            ->using(UserSession::class)
            ->withPivot(['id', 'performed_at']);
    }
}
