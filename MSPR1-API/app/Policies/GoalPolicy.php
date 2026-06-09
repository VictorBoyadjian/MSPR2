<?php

namespace App\Policies;

use App\Access\Controls\GoalControl;
use Lomkit\Access\Policies\ControlledPolicy;

class GoalPolicy extends ControlledPolicy
{
    protected string $control = GoalControl::class;
}
