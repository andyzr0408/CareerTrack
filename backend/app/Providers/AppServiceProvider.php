<?php

namespace App\Providers;

use App\Support\AuthCookie;
use Illuminate\Http\Request;
use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // El token se busca primero en la cabecera Authorization (Postman, pruebas)
        // y si no viene, en la cookie httpOnly que pone el login.
        Sanctum::getAccessTokenFromRequestUsing(function (Request $request): ?string {
            $token = $request->bearerToken() ?: $request->cookie(AuthCookie::NAME);

            return is_string($token) && $token !== '' ? $token : null;
        });
    }
}
