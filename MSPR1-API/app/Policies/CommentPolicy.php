<?php

namespace App\Policies;

use App\Access\Controls\CommentControl;
use Lomkit\Access\Policies\ControlledPolicy;

class CommentPolicy extends ControlledPolicy
{
    protected string $control = CommentControl::class;
}
