<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Lomkit\Access\Controls\HasControl;

class Dish extends Model
{
    use HasControl;

    protected $table = "dishes";

    protected $fillable = [
        'id',
        'name',
        'calories_kcal',
        'proteins_g',
        'carbs_g',
        'fats_g',
        'fiber_g',
        'sugars_g',
        'sodium_mg',
        'cholesterol_mg',
        'meal_type',
        'is_scanned',
        'eated_at',
        'created_at',
        'updated_at'
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
