<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListRequest;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use App\Models\JobOffer;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/** Postulaciones del profesional. */
class ApplicationController extends Controller
{
    public function index(ListRequest $request)
    {
        $applications = Application::where('professional_id', $this->professional($request)->id)
            ->with(['jobOffer' => fn ($q) => $q->with(['company:id,trade_name', 'skills'])])
            ->orderByDesc('applied_at')
            ->orderByDesc('id')
            ->paginate($request->perPage());

        return ApplicationResource::collection($applications);
    }

    public function store(Request $request, int $id): JsonResponse
    {
        $professional = $this->professional($request);
        $offer = JobOffer::published()->findOrFail($id);

        if (! $professional->cv_document) {
            throw ValidationException::withMessages(['cv' => [__('api.cv_required')]]);
        }

        $alreadyApplied = Application::where('professional_id', $professional->id)
            ->where('job_offer_id', $offer->id)
            ->exists();

        if ($alreadyApplied) {
            abort(409, __('api.already_applied'));
        }

        try {
            $application = Application::create([
                'professional_id' => $professional->id,
                'job_offer_id' => $offer->id,
                'status' => Application::STATUS_PENDING,
                'applied_at' => now(),
            ]);
        } catch (UniqueConstraintViolationException) {
            // Dos peticiones a la vez: la restricción única de la tabla gana
            abort(409, __('api.already_applied'));
        }

        $application->load(['jobOffer' => fn ($q) => $q->with(['company:id,trade_name', 'skills'])]);

        return (new ApplicationResource($application))->response()->setStatusCode(201);
    }
}
