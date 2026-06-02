<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Scout\Searchable;
use Lomkit\Access\Controls\HasControl;

class Food extends Model
{
    use HasControl, Searchable;

    protected $table = "foods";

    protected $fillable = [
        'id',
        'name',
        'food_category_id',
        'calories_kcal',
        'proteins_g',
        'carbs_g',
        'fats_g',
        'fiber_g',
        'sugars_g',
        'sodium_mg',
        'cholesterol_mg',
        'meal_type',
        'water_intake_ml',
        'source',
        'created_at',
        'updated_at'
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    public function MealLogs(): HasMany
    {
        return $this->hasMany(MealLog::class);
    }

    public function FoodCategory(): BelongsTo
    {
        return $this->belongsTo(FoodCategory::class);
    }
}
