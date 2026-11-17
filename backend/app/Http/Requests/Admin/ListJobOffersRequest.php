<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\ListRequest;
use App\Models\JobOffer;
use Illuminate\Validation\Rule;

/** Cola de moderación del administrador. */
class ListJobOffersRequest extends ListRequest
{
    protected int $defaultPerPage = 8;

    public function rules(): array
    {
        return [
            ...parent::rules(),
            'moderation_status' => ['sometimes', 'nullable', Rule::in([
                JobOffer::MODERATION_PENDING,
                JobOffer::MODERATION_APPROVED,
                JobOffer::MODERATION_BLOCKED,
            ])],
            'search' => ['sometimes', 'nullable', 'string', 'max:100'],
        ];
    }
}
