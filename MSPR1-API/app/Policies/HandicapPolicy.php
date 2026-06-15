<?php

namespace App\Policies;

use App\Access\Controls\HandicapControl;
use Lomkit\Access\Policies\ControlledPolicy;

class HandicapPolicy extends ControlledPolicy
{
    protected string $control = HandicapControl::class;
}
