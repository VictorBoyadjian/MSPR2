<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\RegisterController;
use App\Rest\Controllers\ExerciceController;
use App\Rest\Controllers\FoodCategoryController;
use App\Rest\Controllers\FoodController;
use App\Rest\Controllers\MealLogController;
use App\Rest\Controllers\MetricController;
use App\Rest\Controllers\SessionController;
use App\Rest\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Lomkit\Rest\Facades\Rest;

Route::middleware(['auth:sanctum'])->group(function () {
    Rest::resource('exercises', ExerciceController::class);
    Rest::resource('foods', FoodController::class);
    Rest::resource('food-categories', FoodCategoryController::class);
    Rest::resource('meal-logs', MealLogController::class);
    Rest::resource('metrics', MetricController::class);
    Rest::resource('sessions', SessionController::class);
    Rest::resource('users', UserController::class);
    Route::get('me', [UserController::class, 'me'])->name('me');
    Route::post('logout', [AuthController::class, 'logout'])->name('logout');
});

Route::post('login', [AuthController::class, 'login'])->name('login');
Route::post('register', [RegisterController::class, 'register'])->name('register');
