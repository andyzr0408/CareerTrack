<?php

namespace App\Http\Requests\Professional;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SyncSkillsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Arreglo vacío = quitar todas las skills
            'skills' => ['present', 'array', 'max:30'],
            'skills.*' => ['string', 'distinct', Rule::exists('skills', 'name')],
        ];
    }
}
