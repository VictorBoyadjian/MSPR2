<?php

namespace App\Rest\Controllers;

use App\Rest\Controllers\Controller;
use App\Rest\Resources\MealLogResource;

class MealLogController extends Controller
{
    /**
     * The resource the controller corresponds to.
     *
     * @var class-string<\Lomkit\Rest\Http\Resource>
     */
    public static $resource = MealLogResource::class;
}
