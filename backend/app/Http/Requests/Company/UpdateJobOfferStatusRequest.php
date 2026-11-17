<?php

namespace App\Http\Requests\Company;

use App\Models\JobOffer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateJobOfferStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in([JobOffer::STATUS_ACTIVE, JobOffer::STATUS_PAUSED])],
        ];
    }
}
