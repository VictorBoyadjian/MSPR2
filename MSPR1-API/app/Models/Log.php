<?php

namespace App\Models;

use Database\Factories\LogFactory;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Lomkit\Access\Controls\HasControl;

#[UseFactory(LogFactory::class)]
class Log extends Model
{
    use HasControl, HasUuids, HasFactory;

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
