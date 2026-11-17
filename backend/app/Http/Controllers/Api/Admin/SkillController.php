<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveSkillRequest;
use App\Http\Resources\SkillResource;
use App\Models\Skill;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

/** Catálogo de skills. */
class SkillController extends Controller
{
    public function store(SaveSkillRequest $request): JsonResponse
    {
        $skill = Skill::create($request->validated());

        return (new SkillResource($skill))->response()->setStatusCode(201);
    }

    public function update(SaveSkillRequest $request, int $id): SkillResource
    {
        $skill = Skill::findOrFail($id);
        $skill->update($request->validated());

        return new SkillResource($skill);
    }

    /** Quita la skill de los perfiles y de las ofertas que la usan, y la borra del catálogo. */
    public function destroy(int $id): Response
    {
        $skill = Skill::findOrFail($id);

        DB::transaction(function () use ($skill) {
            $skill->professionals()->detach();
            $skill->jobOffers()->detach();
            $skill->delete();
        });

        return response()->noContent();
    }
}
