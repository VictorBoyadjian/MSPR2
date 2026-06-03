<?php

namespace App\Policies;

use App\Access\Controls\MealLogControl;
use App\Models\User;
use Lomkit\Access\Policies\ControlledPolicy;

class MealLogPolicy extends ControlledPolicy
{
    protected string $control = MealLogControl::class;
}
