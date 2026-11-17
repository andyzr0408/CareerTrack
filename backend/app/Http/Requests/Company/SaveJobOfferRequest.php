<?php

namespace App\Http\Requests\Company;

use App\Models\JobOffer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Crear (POST) y editar (PUT) una oferta usan las mismas reglas. */
class SaveJobOfferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'modality' => ['required', Rule::in(JobOffer::MODALITIES)],
            // Una oferta remota no necesita ciudad
            'location' => ['nullable', 'required_unless:modality,remote', 'string', 'max:255'],
            'salary_range' => ['nullable', 'string', 'max:255'],
            'skills' => ['required', 'array', 'min:1', 'max:15'],
            'skills.*' => ['string', 'distinct', Rule::exists('skills', 'name')],
        ];
    }
}
