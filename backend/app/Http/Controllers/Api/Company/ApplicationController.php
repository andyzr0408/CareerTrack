<?php

namespace App\Http\Controllers\Api\Company;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\UpdateApplicationStatusRequest;
use App\Http\Requests\ListRequest;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;

/** Candidatos de las ofertas de la empresa autenticada. */
class ApplicationController extends Controller
{
    public function index(ListRequest $request, int $id)
    {
        $offer = $this->company($request)->jobOffers()->findOrFail($id);

        $applications = $offer->applications()
            ->with('professional.skills')
            ->orderByDesc('applied_at')
            ->orderByDesc('id')
            ->paginate($request->perPage());

        return ApplicationResource::collection($applications);
    }

    public function update(UpdateApplicationStatusRequest $request, int $id): ApplicationResource
    {
        $companyId = $this->company($request)->id;

        $application = Application::whereHas('jobOffer', fn ($q) => $q->where('company_id', $companyId))
            ->findOrFail($id);

        $application->update(['status' => $request->validated('status')]);

        return new ApplicationResource($application->load('professional.skills'));
    }
}
