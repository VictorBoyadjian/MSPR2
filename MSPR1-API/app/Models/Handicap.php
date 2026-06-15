<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Lomkit\Access\Controls\HasControl;

class Handicap extends Model
{
    use HasControl;

    protected $table = "handicaps";

    public $timestamps = false;

    protected $fillable = [
        'id',
        'name',
        'label',
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_handicaps');
    }
}
