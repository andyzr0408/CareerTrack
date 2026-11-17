<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Company */
class CompanyResource extends JsonResource
{
    /** Resumen del panel; solo se incluye en GET /company. */
    private ?array $statsData = null;

    public function withStats(array $stats): static
    {
        $this->statsData = $stats;

        return $this;
    }

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'trade_name' => $this->trade_name,
            'tax_id' => $this->tax_id,
            'stats' => $this->when($this->statsData !== null, fn () => $this->statsData),
        ];
    }
}
