<?php

namespace App\Access\Controls;

use App\Access\Perimeters\GlobalPerimiter;
use App\Access\Perimeters\OwnPerimiter;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Lomkit\Access\Controls\Control;

class UserControl extends Control
{
     /**
      * The model the control refers to.
      * @var class-string<Model>
      */
     protected string $model = User::class;

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
                    return 
                        $user->can(sprintf('%s metrics', $method))
                        &&
                        $user->roles()->where('name', 'Administrator')->exists()
                    ;
                })
                ->should(function (Model $user, Model $model) {
                    return true;
                })
                ->query(function (Builder $query, Model $user) {
                    return $query;
                }),

            OwnPerimiter::new()
                ->allowed(function (Model $user, string $method) {
                    return $user->can(sprintf('%s metrics', $method));
                })
                ->should(function (Model $user, Model $model) {
                    return $model->id === $user->getKey();
                })
                ->query(function (Builder $query, Model $user) {
                    return $query->
                        where('id', $user->getKey());
                })
        ];
    }
}
