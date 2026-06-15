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

    /**
     * `eated_at` est une colonne timestamp custom : sans cast, Eloquent la renvoie
     * en chaîne brute « Y-m-d H:i:s » (sans fuseau), que le front interprète comme
     * heure locale → décalage UTC. Le cast datetime force une sérialisation ISO-8601
     * UTC (« ...Z ») que `new Date()` parse sans ambiguïté. La base reste en UTC.
     */
    protected $casts = [
        'eated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
