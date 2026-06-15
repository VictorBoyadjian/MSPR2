<?php

namespace App\Access\Controls;

use App\Access\Perimeters\GlobalPerimiter;
use App\Models\Allergy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Lomkit\Access\Controls\Control;

class AllergyControl extends Control
{
     /**
      * The model the control refers to.
      * @var class-string<Model>
      */
     protected string $model = Allergy::class;

    /**
     * Retrieve the list of perimeter definitions for the current control.
     *
     * @return array<\Lomkit\Access\Perimeters\Perimeter> An array of Perimeter objects.
     */
    protected function perimeters(): array
    {
        return [
            GlobalPerimiter::new()
                ->allowed(function (Model $user, string $method) {
                    return true;
                })
                ->should(function (Model $user, Model $model) {
                    return true;
                })
                ->query(function (Builder $query, Model $user) {
                    return $query;
                })
        ];
    }
}
