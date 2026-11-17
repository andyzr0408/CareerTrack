<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/** @mixin \App\Models\ProfessionalProfile */
class ProfessionalResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'full_name' => $this->full_name,
            'headline' => $this->headline,
            'cv' => $this->cv_document ? [
                'name' => basename($this->cv_document),
                'url' => Storage::disk('public')->url($this->cv_document),
            ] : null,
            'skills' => $this->whenLoaded('skills', fn () => $this->skills->pluck('name')->values()),
            'applications_count' => $this->whenCounted('applications'),
            'favorites_count' => $this->whenCounted('favorites'),
        ];
    }
}
