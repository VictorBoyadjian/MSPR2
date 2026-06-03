<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Lomkit\Access\Controls\HasControl;

class Image extends Model
{
    use HasControl;

    protected $table = "images";

    protected $fillable = [
        'id',
        'path',
        'created_at',
        'updated_at'
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    public function Users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function Dishes(): HasMany
    {
        return $this->hasMany(Dish::class);
    }
}
