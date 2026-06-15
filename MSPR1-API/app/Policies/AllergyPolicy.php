<?php

namespace App\Policies;

use App\Access\Controls\AllergyControl;
use Lomkit\Access\Policies\ControlledPolicy;

class AllergyPolicy extends ControlledPolicy
{
    protected string $control = AllergyControl::class;
}
