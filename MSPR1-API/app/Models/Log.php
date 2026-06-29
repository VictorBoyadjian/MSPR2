<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Lomkit\Access\Controls\HasControl;

class Log extends Model
{
    use HasControl, HasUuids;

    protected $fillable = [
        'id',
        'api_name',
        'data',
        'type',
        'ip',
        'created_at',
        'updated_at'
    ];
}
