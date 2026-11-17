<?php

namespace App\Http\Controllers\Api\Company;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\SaveJobOfferRequest;
use App\Http\Requests\Company\UpdateJobOfferStatusRequest;
use App\Http\Requests\ListRequest;
use App\Http\Resources\JobOfferResource;
use App\Models\JobOffer;
use App\Models\Skill;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

/** Ofertas de la empresa autenticada. Lo que no es suyo responde 404. */
class JobOfferController extends Controller
{
    public function index(ListRequest $request)
    {
        $offers = $this->company($request)->jobOffers()
            ->with('skills')
            ->withCount(JobOffer::applicationCounts())
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($request->perPage());

        return JobOfferResource::collection($offers);
    }

    /** Toda oferta nueva queda activa pero pendiente de moderación. */
    public function store(SaveJobOfferRequest $request): JsonResponse
    {
        $company = $this->company($request);
        $data = $request->validated();
        $skills = Skill::idsFor($data['skills']);
        unset($data['skills']);

        $offer = DB::transaction(function () use ($company, $data, $skills) {
            $offer = $company->jobOffers()->create([
                ...$data,
                'status' => JobOffer::STATUS_ACTIVE,
                'moderation_status' => JobOffer::MODERATION_PENDING,
            ]);
            $offer->skills()->sync($skills);

            return $offer;
        });

        return $this->respond($offer)->response()->setStatusCode(201);
    }

    /**
     * Si la oferta ya estaba aprobada vuelve a revisión, porque el contenido cambió.
     * Una oferta bloqueada sigue bloqueada hasta que el administrador decida.
     */
    public function update(SaveJobOfferRequest $request, int $id): JobOfferResource
    {
        $offer = $this->company($request)->jobOffers()->findOrFail($id);
        $data = $request->validated();
        $skills = Skill::idsFor($data['skills']);
        unset($data['skills']);

        if ($offer->moderation_status === JobOffer::MODERATION_APPROVED) {
            $data['moderation_status'] = JobOffer::MODERATION_PENDING;
        }

        DB::transaction(function () use ($offer, $data, $skills) {
            $offer->update($data);
            $offer->skills()->sync($skills);
        });

        return $this->respond($offer);
    }

    /** Pausar o reactivar. */
    public function updateStatus(UpdateJobOfferStatusRequest $request, int $id): JobOfferResource
    {
        $offer = $this->company($request)->jobOffers()->findOrFail($id);
        $offer->update(['status' => $request->validated('status')]);

        return $this->respond($offer);
    }

    /** Borra la oferta y todo lo que depende de ella (postulaciones, guardados, skills). */
    public function destroy(Request $request, int $id): Response
    {
        $offer = $this->company($request)->jobOffers()->findOrFail($id);

        DB::transaction(function () use ($offer) {
            $offer->applications()->delete();
            $offer->favorites()->delete();
            $offer->skills()->detach();
            $offer->delete();
        });

        return response()->noContent();
    }

    private function respond(JobOffer $offer): JobOfferResource
    {
        $offer->load('skills')->loadCount(JobOffer::applicationCounts());

        return new JobOfferResource($offer);
    }
}
