<?php

namespace App\Http\Requests\Admin;

use App\Models\JobOffer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ModerateJobOfferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Se puede aprobar o bloquear; volver a "pending" solo lo hace la empresa al editar
            'moderation_status' => ['required', Rule::in([
                JobOffer::MODERATION_APPROVED,
                JobOffer::MODERATION_BLOCKED,
            ])],
        ];
    }
}
