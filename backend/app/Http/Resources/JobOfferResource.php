<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\FormatsDates;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Cada bloque opcional aparece solo si el controlador cargó la relación o el contador:
 * así una misma oferta sirve para el profesional, la empresa y el administrador.
 *
 * @mixin \App\Models\JobOffer
 */
class JobOfferResource extends JsonResource
{
    use FormatsDates;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'modality' => $this->modality,
            'location' => $this->location,
            'salary_range' => $this->salary_range,
            'status' => $this->status,
            'moderation_status' => $this->moderation_status,
            'created_at' => $this->created_at?->toIso8601String(),
            'days_ago' => $this->daysSince($this->created_at),

            'company' => $this->whenLoaded('company', fn () => [
                'id' => $this->company->id,
                'trade_name' => $this->company->trade_name,
            ]),
            'skills' => $this->whenLoaded('skills', fn () => $this->skills->pluck('name')->values()),

            // Panel de la empresa (withCount)
            'applications_count' => $this->whenCounted('applications'),
            'pending_applications_count' => $this->when(
                array_key_exists('pending_applications_count', $this->resource->getAttributes()),
                fn () => (int) $this->pending_applications_count,
            ),

            // Estado para el profesional que mira (scope withViewerState)
            'saved' => $this->when(
                $this->relationLoaded('favorites'),
                fn () => $this->favorites->isNotEmpty(),
            ),
            'application' => $this->when($this->relationLoaded('applications'), function () {
                $application = $this->applications->first();

                return $application ? [
                    'id' => $application->id,
                    'status' => $application->status,
                    'applied_at' => $application->applied_at?->toIso8601String(),
                ] : null;
            }),
        ];
    }
}
