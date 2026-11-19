<?php

use App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Company;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\JobOfferController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ProfileStatsController;
use App\Http\Controllers\Api\SkillController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API de CareerTrack (prefijo /api)
|--------------------------------------------------------------------------
| Documentación de parámetros y respuestas: docs/api.md
| Explicación por tipo de usuario: docs/rutas.md
*/

// Visitante (sin sesión)
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});
Route::get('/skills', [SkillController::class, 'index']);

// Con sesión: token de Sanctum y cuenta activa
Route::middleware(['auth:sanctum', 'active'])->group(function () {

    // Cualquier rol
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::patch('/me/deactivate', [AuthController::class, 'deactivate']);

    // Profesional
    Route::middleware('role:professional')->group(function () {
        Route::get('/job-offers', [JobOfferController::class, 'index']);
        Route::get('/job-offers/{id}', [JobOfferController::class, 'show'])->whereNumber('id');

        Route::get('/profile/stats', ProfileStatsController::class);
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::put('/profile', [ProfileController::class, 'update']);
        Route::post('/profile/cv', [ProfileController::class, 'uploadCv']);
        Route::put('/profile/skills', [ProfileController::class, 'syncSkills']);

        Route::get('/applications', [ApplicationController::class, 'index']);
        Route::post('/job-offers/{id}/applications', [ApplicationController::class, 'store'])->whereNumber('id');

        Route::get('/favorites', [FavoriteController::class, 'index']);
        Route::post('/job-offers/{id}/favorite', [FavoriteController::class, 'store'])->whereNumber('id');
        Route::delete('/job-offers/{id}/favorite', [FavoriteController::class, 'destroy'])->whereNumber('id');
    });

    // Empresa
    Route::prefix('company')->middleware('role:company')->group(function () {
        Route::get('/stats', Company\StatsController::class);
        Route::get('/', [Company\CompanyController::class, 'show']);
        Route::put('/', [Company\CompanyController::class, 'update']);

        Route::get('/job-offers', [Company\JobOfferController::class, 'index']);
        Route::post('/job-offers', [Company\JobOfferController::class, 'store']);
        Route::put('/job-offers/{id}', [Company\JobOfferController::class, 'update'])->whereNumber('id');
        Route::patch('/job-offers/{id}/status', [Company\JobOfferController::class, 'updateStatus'])->whereNumber('id');
        Route::delete('/job-offers/{id}', [Company\JobOfferController::class, 'destroy'])->whereNumber('id');

        Route::get('/job-offers/{id}/applications', [Company\ApplicationController::class, 'index'])->whereNumber('id');
        Route::patch('/applications/{id}', [Company\ApplicationController::class, 'update'])->whereNumber('id');
    });

    // Administrador
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::get('/stats', Admin\StatsController::class);

        Route::get('/job-offers', [Admin\JobOfferController::class, 'index']);
        Route::patch('/job-offers/{id}/moderation', [Admin\JobOfferController::class, 'moderate'])->whereNumber('id');

        Route::get('/users', [Admin\UserController::class, 'index']);
        Route::patch('/users/{id}/status', [Admin\UserController::class, 'updateStatus'])->whereNumber('id');

        Route::post('/skills', [Admin\SkillController::class, 'store']);
        Route::put('/skills/{id}', [Admin\SkillController::class, 'update'])->whereNumber('id');
        Route::delete('/skills/{id}', [Admin\SkillController::class, 'destroy'])->whereNumber('id');
    });
});
