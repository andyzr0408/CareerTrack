<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListRequest;
use App\Http\Resources\JobOfferResource;
use App\Models\Favorite;
use App\Models\JobOffer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/** Ofertas guardadas por el profesional. */
class FavoriteController extends Controller
{
    public function index(ListRequest $request)
    {
        $professionalId = $this->professional($request)->id;

        // Si una oferta guardada se pausó o se bloqueó, deja de mostrarse (el guardado se conserva)
        $offers = JobOffer::published()
            ->whereHas('favorites', fn ($q) => $q->where('professional_id', $professionalId))
            ->withViewerState($professionalId)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($request->perPage());

        return JobOfferResource::collection($offers);
    }

    /** Idempotente: guardar dos veces la misma oferta no da error. */
    public function store(Request $request, int $id): JsonResponse
    {
        $offer = JobOffer::published()->findOrFail($id);

        Favorite::firstOrCreate([
            'professional_id' => $this->professional($request)->id,
            'job_offer_id' => $offer->id,
        ]);

        return response()->json(['message' => __('api.favorite_added')]);
    }

    public function destroy(Request $request, int $id): Response
    {
        Favorite::where('professional_id', $this->professional($request)->id)
            ->where('job_offer_id', $id)
            ->delete();

        return response()->noContent();
    }
}
