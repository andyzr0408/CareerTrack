<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SkillResource;
use App\Models\Skill;

class SkillController extends Controller
{
    /** Catálogo completo (público): lo usan los formularios y los filtros, por eso no se pagina. */
    public function index()
    {
        return SkillResource::collection(Skill::orderBy('name')->get());
    }
}
