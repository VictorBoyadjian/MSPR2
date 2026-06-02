<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Scout\Searchable;
use Lomkit\Access\Controls\HasControl;

class Metric extends Model
{
    use HasControl, Searchable;

    protected $table = "metrics";

    protected $fillable = [
        'id',
        'user_id',
        'recorded_at',
        'weight_kg',
        'bmi',
        'body_fat_pct',
        'heart_rate_avg',
        'heart_rate_max',
        'heart_rate_resting',
        'calories_burned',
        'session_duration_h',
        'workout_type',
        'workout_frequency',
        'water_intake_l',
        'experience_level',
        'created_at',
        'updated_at'
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    public function User(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
