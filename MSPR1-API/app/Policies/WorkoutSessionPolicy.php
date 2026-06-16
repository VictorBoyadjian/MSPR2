<?php

namespace App\Policies;

use App\Access\Controls\WorkoutSessionControl;
use Lomkit\Access\Policies\ControlledPolicy;

class WorkoutSessionPolicy extends ControlledPolicy
{
    protected string $control = WorkoutSessionControl::class;
}
