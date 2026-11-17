<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Baja lógica: si la cuenta se desactivó después de emitir el token,
 * se revocan sus tokens y se rechaza la petición.
 */
class EnsureAccountIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ! $user->isActive()) {
            $user->tokens()->delete();
            abort(403, __('auth.inactive'));
        }

        return $next($request);
    }
}
