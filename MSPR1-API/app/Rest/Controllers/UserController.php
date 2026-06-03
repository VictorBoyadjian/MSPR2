<?php

namespace App\Rest\Controllers;

use App\Rest\Controllers\Controller;
use App\Rest\Resources\UserResource;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * The resource the controller corresponds to.
     *
     * @var class-string<\Lomkit\Rest\Http\Resource>
     */
    public static $resource = UserResource::class;

    public function me()
    {
        return Auth::user();
    }
}
