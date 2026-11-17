<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ListJobOffersRequest;
use App\Http\Requests\Admin\ModerateJobOfferRequest;
use App\Http\Resources\JobOfferResource;
use App\Models\JobOffer;
use Illuminate\Database\Eloquent\Builder;

/** Moderación de ofertas. */
class JobOfferController extends Controller
{
    public function index(ListJobOffersRequest $request)
    {
        $query = JobOffer::with(['company:id,trade_name', 'skills']);

        if ($status = $request->validated('moderation_status')) {
            $query->where('moderation_status', $status);
        }

        if ($search = $request->validated('search')) {
            $like = $this->like($search);
            $query->where(function (Builder $q) use ($like) {
                $q->where('title', 'like', $like)
                    ->orWhereHas('company', fn (Builder $c) => $c->where('trade_name', 'like', $like));
            });
        }

        $offers = $query
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($request->perPage())
            ->withQueryString();

        return JobOfferResource::collection($offers);
    }

    public function moderate(ModerateJobOfferRequest $request, int $id): JobOfferResource
    {
        $offer = JobOffer::findOrFail($id);
        $offer->update(['moderation_status' => $request->validated('moderation_status')]);

        return new JobOfferResource($offer->load(['company:id,trade_name', 'skills']));
    }
}
