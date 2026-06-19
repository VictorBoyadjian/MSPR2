<?php

namespace App\Policies;

use App\Access\Controls\PostControl;
use Lomkit\Access\Policies\ControlledPolicy;

class PostPolicy extends ControlledPolicy
{
    protected string $control = PostControl::class;
}
