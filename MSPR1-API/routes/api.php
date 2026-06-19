<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\HealthMetricController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\UserSessionController;
use App\Rest\Controllers\AllergyController;
use App\Rest\Controllers\CommentController;
use App\Rest\Controllers\DishController;
use App\Rest\Controllers\GoalController;
use App\Rest\Controllers\HandicapController;
use App\Rest\Controllers\MetricController;
use App\Rest\Controllers\PostController;
use App\Rest\Controllers\UserController;
use App\Rest\Controllers\WorkoutExerciseController;
use App\Rest\Controllers\WorkoutSessionController;
use Illuminate\Support\Facades\Route;
use Lomkit\Rest\Facades\Rest;

Route::middleware(['auth:sanctum'])->group(function () {
    Rest::resource('allergies', AllergyController::class);
    Rest::resource('dishes', DishController::class);
    Rest::resource('workout_exercises', WorkoutExerciseController::class);
    Rest::resource('workout_sessions', WorkoutSessionController::class);
    Rest::resource('goals', GoalController::class);
    Rest::resource('handicaps', HandicapController::class);
    Rest::resource('metrics', MetricController::class);
    Rest::resource('posts', PostController::class);
    Rest::resource('comments', CommentController::class);
    Rest::resource('users', UserController::class)->only('search');

    Route::get('me', [UserController::class, 'me'])->name('me');
    Route::patch('me', [ProfileController::class, 'update'])->name('me.update');
    Route::delete('me', [ProfileController::class, 'destroy'])->name('me.destroy');

    // Séances de l'utilisateur connecté (faites / planifiées).
    Route::get('me/sessions', [UserSessionController::class, 'index'])->name('me.sessions.index');
    Route::get('me/sessions/stats', [UserSessionController::class, 'stats'])->name('me.sessions.stats');
    Route::post('me/sessions', [UserSessionController::class, 'store'])->name('me.sessions.store');
    Route::patch('me/sessions/{id}', [UserSessionController::class, 'update'])->name('me.sessions.update');
    Route::delete('me/sessions/{id}', [UserSessionController::class, 'destroy'])->name('me.sessions.destroy');

    // Suivi santé : une métrique par jour (poids, pouls au repos), calculs sport à part.
    Route::get('me/metrics/current', [HealthMetricController::class, 'current'])->name('me.metrics.current');
    Route::put('me/metrics', [HealthMetricController::class, 'upsert'])->name('me.metrics.upsert');

    Route::post('logout', [AuthController::class, 'logout'])->name('logout');
});

Route::post('login', [AuthController::class, 'login'])->name('login');
Route::post('register', [RegisterController::class, 'register'])->name('register');
