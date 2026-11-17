<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Crear (POST) y renombrar (PUT) una skill del catálogo. */
class SaveSkillRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:100',
                // En PUT puede conservar su propio nombre
                Rule::unique('skills', 'name')->ignore($this->route('id')),
            ],
        ];
    }
}
