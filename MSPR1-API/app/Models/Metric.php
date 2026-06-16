<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Lomkit\Access\Controls\HasControl;

class Metric extends Model
{
    use HasControl;

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

    /**
     * Force des types numériques (et non des chaînes PDO) côté JSON : le front
     * fait de l'arithmétique sur le poids / pouls et attend des `number`.
     */
    protected $casts = [
        'recorded_at'        => 'datetime',
        'weight_kg'          => 'float',
        'bmi'                => 'float',
        'body_fat_pct'       => 'float',
        'heart_rate_avg'     => 'integer',
        'heart_rate_max'     => 'integer',
        'heart_rate_resting' => 'integer',
        'calories_burned'    => 'float',
        'session_duration_h' => 'float',
        'workout_frequency'  => 'integer',
        'water_intake_l'     => 'float',
        'experience_level'   => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
