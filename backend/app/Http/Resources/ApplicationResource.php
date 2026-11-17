<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\FormatsDates;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Application */
class ApplicationResource extends JsonResource
{
    use FormatsDates;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'applied_at' => $this->applied_at?->toIso8601String(),
            'days_ago' => $this->daysSince($this->applied_at),
            'offer' => $this->when(
                $this->relationLoaded('jobOffer'),
                fn () => new JobOfferResource($this->jobOffer),
            ),
            'professional' => $this->when(
                $this->relationLoaded('professional'),
                fn () => new ProfessionalResource($this->professional),
            ),
        ];
    }
}
