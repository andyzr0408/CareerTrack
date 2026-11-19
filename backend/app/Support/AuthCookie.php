<?php

namespace App\Support;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Cookie;

/**
 * Cookie que guarda el token de Sanctum para el navegador.
 *
 * - httpOnly: JavaScript no puede leerla, así un XSS no roba el token.
 * - SameSite=Lax: el navegador no la envía en peticiones que vienen de otros sitios (frena CSRF).
 * - Secure: solo cuando la petición llegó por HTTPS (en local es http).
 */
class AuthCookie
{
    public const NAME = 'ct_token';

    /** Duración de la cookie en minutos (7 días). */
    private const MINUTES = 60 * 24 * 7;

    public static function make(string $token, Request $request): Cookie
    {
        return cookie(
            name: self::NAME,
            value: $token,
            minutes: self::MINUTES,
            path: '/',
            domain: null,
            secure: $request->isSecure(),
            httpOnly: true,
            raw: false,
            sameSite: 'lax',
        );
    }

    /** Cookie ya vencida: el navegador la borra. */
    public static function forget(): Cookie
    {
        return cookie()->forget(self::NAME);
    }
}
