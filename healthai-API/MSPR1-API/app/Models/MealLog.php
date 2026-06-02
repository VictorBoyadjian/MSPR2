<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Scout\Searchable;
use Lomkit\Access\Controls\HasControl;

class MealLog extends Model
{
    use HasControl, Searchable;

    protected $table = "meal_logs";

    protected $fillable = [
        'id',
        'user_id',
        'food_id',
        'meal_type',
        'quantity_g',
        'logged_at',
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

    public function Food(): BelongsTo
    {
        return $this->belongsTo(Food::class);
    }
}
