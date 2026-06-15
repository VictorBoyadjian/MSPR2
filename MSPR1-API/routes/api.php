<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\RegisterController;
use App\Rest\Controllers\AllergyController;
use App\Rest\Controllers\DishController;
use App\Rest\Controllers\ExerciceController;
use App\Rest\Controllers\GoalController;
use App\Rest\Controllers\MetricController;
use App\Rest\Controllers\SportSessionController;
use App\Rest\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Lomkit\Rest\Facades\Rest;

Route::middleware(['auth:sanctum'])->group(function () {
    Rest::resource('allergies', AllergyController::class);
    Rest::resource('dishes', DishController::class);
    Rest::resource('exercises', ExerciceController::class);
    Rest::resource('goals', GoalController::class);
    Rest::resource('metrics', MetricController::class);
    Rest::resource('sport_sessions', SportSessionController::class);
    Rest::resource('users', UserController::class)->only('search');
    
    Route::get('me', [UserController::class, 'me'])->name('me');
    Route::post('logout', [AuthController::class, 'logout'])->name('logout');
});

Route::post('login', [AuthController::class, 'login'])->name('login');
Route::post('register', [RegisterController::class, 'register'])->name('register');
