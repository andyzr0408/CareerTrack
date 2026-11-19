<?php

namespace App\Http\Middleware;

use App\Support\AuthCookie;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * El navegador manda el token en la cookie httpOnly; aquí se copia a la cabecera
 * Authorization para que Sanctum lo valide igual que un token Bearer.
 * Si la petición ya trae su propia cabecera (Postman, pruebas), esa manda.
 */
class AuthenticateFromCookie
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->bearerToken() && is_string($token = $request->cookie(AuthCookie::NAME)) && $token !== '') {
            $request->headers->set('Authorization', 'Bearer '.$token);
        }

        return $next($request);
    }
}
