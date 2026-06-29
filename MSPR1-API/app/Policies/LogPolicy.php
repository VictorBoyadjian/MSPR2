<?php

namespace App\Policies;

use App\Access\Controls\LogControl;
use Lomkit\Access\Policies\ControlledPolicy;

class LogPolicy extends ControlledPolicy
{
    protected string $control = LogControl::class;
}
