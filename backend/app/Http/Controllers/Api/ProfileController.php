<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Professional\SyncSkillsRequest;
use App\Http\Requests\Professional\UpdateProfileRequest;
use App\Http\Requests\Professional\UploadCvRequest;
use App\Http\Resources\ProfessionalResource;
use App\Models\ProfessionalProfile;
use App\Models\Skill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProfileController extends Controller
{
    public function show(Request $request): ProfessionalResource
    {
        return $this->respond($this->professional($request));
    }

    public function update(UpdateProfileRequest $request): ProfessionalResource
    {
        $professional = $this->professional($request);
        $professional->update($request->validated());

        return $this->respond($professional);
    }

    /** Guarda el PDF en el disco público (storage/app/public/cvs/{id}/) y su ruta en la base. */
    public function uploadCv(UploadCvRequest $request): ProfessionalResource
    {
        $professional = $this->professional($request);
        $previous = $professional->cv_document;

        $filename = 'cv-'.(Str::slug($professional->full_name) ?: 'profesional').'.pdf';
        $path = $request->file('cv')->storeAs('cvs/'.$professional->id, $filename, 'public');

        // Si reemplaza un CV con otro nombre de archivo, se borra el anterior
        if ($previous && $previous !== $path) {
            Storage::disk('public')->delete($previous);
        }

        $professional->update(['cv_document' => $path]);

        return $this->respond($professional);
    }

    public function syncSkills(SyncSkillsRequest $request): ProfessionalResource
    {
        $professional = $this->professional($request);
        $professional->skills()->sync(Skill::idsFor($request->validated('skills')));

        return $this->respond($professional);
    }

    private function respond(ProfessionalProfile $professional): ProfessionalResource
    {
        $professional->load('skills')->loadCount(['applications', 'favorites']);

        return new ProfessionalResource($professional);
    }
}
