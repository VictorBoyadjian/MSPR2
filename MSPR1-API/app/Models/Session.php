<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Laravel\Scout\Searchable;
use Lomkit\Access\Controls\HasControl;

class Session extends Model
{
    use HasControl, Searchable;

    protected $table = "sessions";

    protected $fillable = [
        'id',
        'user_id',
        'duration_min',
        'performed_at',
        'created_at',
        'updated_at'
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    public function Exercises() : BelongsToMany
    {
        return $this->belongsToMany(Exercise::class, 'sessions_exercises')
            ->withPivot(['reps', 'sets', 'duration_min']);
    }

    public function User() : BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
