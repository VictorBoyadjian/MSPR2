<?php

namespace App\Policies;

use App\Access\Controls\MetricControl;
use Lomkit\Access\Policies\ControlledPolicy;

class MetricPolicy extends ControlledPolicy
{
    protected string $control = MetricControl::class;
}
