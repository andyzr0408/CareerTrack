<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\ProfessionalProfile;
use Illuminate\Http\Request;

abstract class Controller
{
    /** Perfil profesional de quien hace la petición (las rutas ya exigen ese rol). */
    protected function professional(Request $request): ProfessionalProfile
    {
        return $request->user()->professionalProfile ?? abort(403, __('auth.forbidden'));
    }

    /** Empresa de quien hace la petición (las rutas ya exigen ese rol). */
    protected function company(Request $request): Company
    {
        return $request->user()->company ?? abort(403, __('auth.forbidden'));
    }

    /** Patrón LIKE para búsquedas por texto. */
    protected function like(string $term): string
    {
        return '%'.$term.'%';
    }
}
