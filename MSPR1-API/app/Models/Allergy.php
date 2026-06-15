<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Lomkit\Access\Controls\HasControl;

class Allergy extends Model
{
    use HasControl;

    protected $table = "allergies";

    public $timestamps = false;

    protected $fillable = [
        'id',
        'name',
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_allergies');
    }
}
