<?php

namespace App\Rest\Controllers;

use App\Rest\Controllers\Controller;
use App\Rest\Resources\FoodCategoryResource;

class FoodCategoryController extends Controller
{
    /**
     * The resource the controller corresponds to.
     *
     * @var class-string<\Lomkit\Rest\Http\Resource>
     */
    public static $resource = FoodCategoryResource::class;
}
