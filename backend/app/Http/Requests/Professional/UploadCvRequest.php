<?php

namespace App\Http\Requests\Professional;

use Illuminate\Foundation\Http\FormRequest;

class UploadCvRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // máx. en KB: 5120 = 5 MB
            'cv' => ['required', 'file', 'mimes:pdf', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'cv.mimes' => 'El currículum debe ser un archivo PDF.',
            'cv.max' => 'El currículum no puede pesar más de 5 MB.',
        ];
    }
}
