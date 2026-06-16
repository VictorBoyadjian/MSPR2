<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Lomkit\Access\Controls\HasControl;

class WorkoutExercise extends Model
{
    use HasControl;

    protected $table = "workout_exercises";

    // La table n'a que created_at (pas d'updated_at) : on désactive la gestion auto.
    public $timestamps = false;

    protected $fillable = [
        'id',
        'name',
        'body_part',
        'category',
        'difficulty',
        'equipment',
        'description',
        'created_at',
    ];

    public function sessions(): BelongsToMany
    {
        return $this->belongsToMany(WorkoutSession::class, 'session_exercises', 'exercise_id', 'session_id')
            ->withPivot(['order_num', 'sets', 'reps', 'rest_sec', 'notes']);
    }
}
