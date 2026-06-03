<?php

namespace App\Policies;

use App\Access\Controls\SportSessionControl;
use Lomkit\Access\Policies\ControlledPolicy;

class SportSessionPolicy extends ControlledPolicy
{ 
    protected string $control = SportSessionControl::class;
}
