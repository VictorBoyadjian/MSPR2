<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\MorphTo;
use Lomkit\Access\Controls\HasControl;

class Media extends \Spatie\MediaLibrary\MediaCollections\Models\Media
{
    use HasControl;

    public function model() : MorphTo
    {
        return $this->morphTo('model');
    }
}