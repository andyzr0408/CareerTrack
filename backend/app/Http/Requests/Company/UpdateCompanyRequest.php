<?php

namespace App\Http\Requests\Company;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCompanyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'trade_name' => ['required', 'string', 'max:255'],
            'tax_id' => [
                'required',
                'string',
                'max:255',
                // Puede conservar su propia identificación fiscal
                Rule::unique('companies', 'tax_id')->ignore($this->user()->company?->id),
            ],
        ];
    }
}
