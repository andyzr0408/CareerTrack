<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\User */
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'role' => $this->role?->name,
            'status' => $this->status,
            'name' => $this->displayName(),
            'created_at' => $this->created_at?->toIso8601String(),
            'professional' => $this->when(
                $this->relationLoaded('professionalProfile') && $this->professionalProfile !== null,
                fn () => new ProfessionalResource($this->professionalProfile),
            ),
            'company' => $this->when(
                $this->relationLoaded('company') && $this->company !== null,
                fn () => new CompanyResource($this->company),
            ),
        ];
    }
}
