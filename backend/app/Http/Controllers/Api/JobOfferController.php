<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Professional\ListJobOffersRequest;
use App\Http\Resources\JobOfferResource;
use App\Models\JobOffer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

/** Catálogo de ofertas para el profesional: solo las activas y aprobadas. */
class JobOfferController extends Controller
{
    public function index(ListJobOffersRequest $request)
    {
        $professional = $this->professional($request);

        $query = JobOffer::published()->withViewerState($professional->id);

        if ($search = $request->validated('search')) {
            $like = $this->like($search);
            $query->where(function (Builder $q) use ($like) {
                $q->where('title', 'like', $like)
                    ->orWhere('location', 'like', $like)
                    ->orWhereHas('company', fn (Builder $c) => $c->where('trade_name', 'like', $like))
                    ->orWhereHas('skills', fn (Builder $s) => $s->where('name', 'like', $like));
            });
        }

        if ($modality = $request->validated('modality')) {
            $query->where('modality', $modality);
        }

        // La oferta debe pedir TODAS las skills elegidas
        foreach ($request->validated('skills', []) as $name) {
            $query->whereHas('skills', fn (Builder $s) => $s->where('name', $name));
        }

        if ($request->validated('sort') === ListJobOffersRequest::SORT_MATCH) {
            $this->orderByMatch($query, $professional->skills()->pluck('skills.id')->all());
        }

        $offers = $query
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($request->perPage())
            ->withQueryString();

        return JobOfferResource::collection($offers);
    }

    public function show(Request $request, int $id): JobOfferResource
    {
        $offer = JobOffer::published()
            ->withViewerState($this->professional($request)->id)
            ->findOrFail($id);

        return new JobOfferResource($offer);
    }

    /**
     * Ordena por % de coincidencia: skills en común / skills que pide la oferta.
     * Va como subconsultas para que funcione igual en SQLite, MySQL y PostgreSQL.
     *
     * @param  array<int, int>  $skillIds  skills del profesional
     */
    private function orderByMatch(Builder $query, array $skillIds): void
    {
        if ($skillIds === []) {
            return; // sin skills todas coinciden 0 %: queda el orden por fecha
        }

        $placeholders = implode(',', array_fill(0, count($skillIds), '?'));

        $query->orderByRaw(
            "COALESCE(
                (SELECT COUNT(*) FROM job_offer_skill s
                  WHERE s.job_offer_id = job_offers.id AND s.skill_id IN ($placeholders)) * 1.0
                / NULLIF((SELECT COUNT(*) FROM job_offer_skill t WHERE t.job_offer_id = job_offers.id), 0),
            0) DESC",
            $skillIds,
        );
    }
}
