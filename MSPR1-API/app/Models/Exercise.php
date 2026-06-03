<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Lomkit\Access\Controls\HasControl;
use Laravel\Scout\Searchable;

class Exercise extends Model
{
    use HasControl;

    protected $table = "exercises";

    protected $fillable = [
        'id',
        'name',
        'category',
        'body_part',
        'equipment',
        'difficulty',
        'instructions',
        'source',
        'created_at',
        'updated_at'
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    public function Sessions(): BelongsToMany
    {
        return $this->belongsToMany(Session::class, 'sessions_exercises')
            ->withPivot(['reps', 'sets', 'duration_min']);
    }
}
