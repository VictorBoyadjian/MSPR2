<?php

namespace App\Policies;

use App\Access\Controls\MediaControl;
use Lomkit\Access\Policies\ControlledPolicy;

class MediaPolicy extends ControlledPolicy
{
    protected string $control = MediaControl::class;
}
