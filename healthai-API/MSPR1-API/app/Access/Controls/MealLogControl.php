<?php

namespace App\Access\Controls;

use App\Access\Perimeters\OwnPerimiter;
use App\Models\MealLog;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Lomkit\Access\Controls\Control;

class MealLogControl extends Control
{
     /**
      * The model the control refers to.
      * @var class-string<Model>
      */
     protected string $model = MealLog::class;

    /**
     * Retrieve the list of perimeter definitions for the current control.
     *
     * @return array<\Lomkit\Access\Perimeters\Perimeter> An array of Perimeter objects.
     */
    protected function perimeters(): array
    {
        return [
            OwnPerimiter::new()
                ->allowed(function (Model $user, string $method) {
                    return $user->can(sprintf('%s meal_logs', $method));
                })
                ->should(function (Model $user, Model $model) {
                    return $model->user_id === $user->getKey();
                })
                ->query(function (Builder $query, Model $user) {
                    return $query->
                        where('user_id', $user->getKey());
                })
        ];
    }
}
