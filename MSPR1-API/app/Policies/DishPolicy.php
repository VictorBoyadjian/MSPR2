<?php

namespace App\Policies;

use App\Access\Controls\DishControl;
use Lomkit\Access\Policies\ControlledPolicy;

class DishPolicy extends ControlledPolicy
{
    protected string $control = DishControl::class;
}
