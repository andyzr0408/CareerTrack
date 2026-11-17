<?php

namespace App\Http\Controllers\Api\Company;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\UpdateCompanyRequest;
use App\Http\Resources\CompanyResource;
use App\Models\Application;
use App\Models\Company;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    public function show(Request $request): CompanyResource
    {
        return $this->respond($this->company($request));
    }

    public function update(UpdateCompanyRequest $request): CompanyResource
    {
        $company = $this->company($request);
        $company->update($request->validated());

        return $this->respond($company);
    }

    private function respond(Company $company): CompanyResource
    {
        return (new CompanyResource($company))->withStats($this->stats($company));
    }

    /** Números del panel de la empresa. */
    private function stats(Company $company): array
    {
        $received = fn () => Application::whereHas(
            'jobOffer',
            fn ($q) => $q->where('company_id', $company->id),
        );

        return [
            'total_offers' => $company->jobOffers()->count(),
            'live_offers' => $company->jobOffers()->published()->count(),
            'applications_received' => $received()->count(),
            'accepted' => $received()->where('status', Application::STATUS_ACCEPTED)->count(),
        ];
    }
}
