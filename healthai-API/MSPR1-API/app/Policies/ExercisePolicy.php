<?php

namespace App\Policies;

use App\Access\Controls\ExerciseControl;
use Lomkit\Access\Policies\ControlledPolicy;

class ExercisePolicy extends ControlledPolicy
{
    protected string $control = ExerciseControl::class;
}
