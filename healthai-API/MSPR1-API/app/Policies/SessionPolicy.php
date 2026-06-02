<?php

namespace App\Policies;

use App\Access\Controls\SessionControl;
use App\Models\User;
use Lomkit\Access\Policies\ControlledPolicy;

class SessionPolicy extends ControlledPolicy
{ 
    protected string $control = SessionControl::class;
}
