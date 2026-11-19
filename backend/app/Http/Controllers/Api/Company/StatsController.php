<?php

namespace App\Http\Controllers\Api\Company;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\JobOffer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** Números para los gráficos de pastel del panel de la empresa. */
class StatsController extends Controller
{
    public function __invoke(Request $request): JsonResource
    {
        $company = $this->company($request);

        $byStatus = Application::query()
            ->whereHas('jobOffer', fn ($q) => $q->where('company_id', $company->id))
            ->selectRaw('status as label, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'label');

        $offers = fn () => $company->jobOffers();
        $approved = fn () => $offers()->where('moderation_status', JobOffer::MODERATION_APPROVED);

        return new JsonResource([
            'total_applications' => (int) $byStatus->sum(),
            'applications_by_status' => $this->withZeros(Application::STATUSES, $byStatus),
            // Cada oferta cuenta en un solo estado: bloqueada, por revisar, visible o en pausa
            'offers_by_state' => [
                'live' => $approved()->where('status', JobOffer::STATUS_ACTIVE)->count(),
                'paused' => $approved()->where('status', JobOffer::STATUS_PAUSED)->count(),
                'pending' => $offers()->where('moderation_status', JobOffer::MODERATION_PENDING)->count(),
                'blocked' => $offers()->where('moderation_status', JobOffer::MODERATION_BLOCKED)->count(),
            ],
        ]);
    }
}
