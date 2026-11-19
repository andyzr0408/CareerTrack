<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\JobOffer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** Números para los gráficos de pastel del panel del profesional. */
class ProfileStatsController extends Controller
{
    public function __invoke(Request $request): JsonResource
    {
        $profile = $this->professional($request);

        $byStatus = $profile->applications()
            ->selectRaw('applications.status as label, count(*) as total')
            ->groupBy('applications.status')
            ->pluck('total', 'label');

        $byModality = $profile->applications()
            ->join('job_offers', 'job_offers.id', '=', 'applications.job_offer_id')
            ->selectRaw('job_offers.modality as label, count(*) as total')
            ->groupBy('job_offers.modality')
            ->pluck('total', 'label');

        return new JsonResource([
            'total_applications' => $profile->applications()->count(),
            'favorites' => $profile->favorites()->count(),
            // Siempre salen todas las claves (con 0) para que el gráfico tenga una forma fija
            'applications_by_status' => $this->withZeros(Application::STATUSES, $byStatus),
            'applications_by_modality' => $this->withZeros(JobOffer::MODALITIES, $byModality),
        ]);
    }
}
