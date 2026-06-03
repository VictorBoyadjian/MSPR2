<?php

namespace App\Rest\Controllers;

use App\Rest\Controllers\Controller;
use App\Rest\Resources\FoodResource;

class FoodController extends Controller
{
    /**
     * The resource the controller corresponds to.
     *
     * @var class-string<\Lomkit\Rest\Http\Resource>
     */
    public static $resource = FoodResource::class;
}
