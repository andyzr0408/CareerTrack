<?php

use App\Http\Middleware\AuthenticateFromCookie;
use App\Http\Middleware\EnsureAccountIsActive;
use App\Http\Middleware\EnsureRole;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // El token viaja en una cookie httpOnly: se pasa a Authorization antes de auth:sanctum.
        // Va como middleware global para que siempre se ejecute antes que la autenticación.
        $middleware->prepend(AuthenticateFromCookie::class);

        $middleware->alias([
            'role' => EnsureRole::class,
            'active' => EnsureAccountIsActive::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        // findOrFail() sin resultado y rutas inexistentes: mismo 404 corto y en español
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json(['message' => __('api.not_found')], 404);
            }
        });
    })->create();
