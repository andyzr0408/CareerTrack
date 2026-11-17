<?php

namespace App\Http\Requests\Professional;

use App\Http\Requests\ListRequest;
use App\Models\JobOffer;
use Illuminate\Validation\Rule;

/** Filtros del catálogo de ofertas que ve el profesional. */
class ListJobOffersRequest extends ListRequest
{
    public const SORT_RECENT = 'recent';
    public const SORT_MATCH = 'match';

    public function rules(): array
    {
        return [
            ...parent::rules(),
            'search' => ['sometimes', 'nullable', 'string', 'max:100'],
            'modality' => ['sometimes', 'nullable', Rule::in(JobOffer::MODALITIES)],
            'skills' => ['sometimes', 'array', 'max:15'],
            'skills.*' => ['string', 'max:100'],
            'sort' => ['sometimes', 'nullable', Rule::in([self::SORT_RECENT, self::SORT_MATCH])],
        ];
    }
}
