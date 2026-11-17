<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Deja pasar solo a los usuarios cuyo rol esté en la lista.
 * Uso en las rutas: ->middleware('role:company') o 'role:admin,company'.
 */
class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role?->name, $roles, true)) {
            abort(403, __('auth.forbidden'));
        }

        return $next($request);
    }
}
