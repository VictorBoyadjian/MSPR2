<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Scout\Searchable;
use Lomkit\Access\Controls\HasControl;

class FoodCategory extends Model
{
    use HasControl, Searchable;

    protected $table = "food_categories";

    protected $fillable = [
        'id',
        'name',
        'created_at',
        'updated_at'
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    public function Foods(): HasMany
    {
        return $this->hasMany(Food::class);
    }
}
