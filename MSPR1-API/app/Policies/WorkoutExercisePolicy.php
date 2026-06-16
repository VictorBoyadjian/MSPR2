<?php

namespace App\Policies;

use App\Access\Controls\WorkoutExerciseControl;
use Lomkit\Access\Policies\ControlledPolicy;

class WorkoutExercisePolicy extends ControlledPolicy
{
    protected string $control = WorkoutExerciseControl::class;
}
