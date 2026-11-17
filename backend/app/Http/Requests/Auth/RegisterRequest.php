<?php

namespace App\Http\Requests\Auth;

use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('email'))) {
            $this->merge(['email' => mb_strtolower(trim($this->input('email')))]);
        }
    }

    public function rules(): array
    {
        return [
            // El administrador no se registra desde la web: lo crea el seeder
            'role' => ['required', Rule::in([Role::PROFESSIONAL, Role::COMPANY])],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'max:255'],

            // Profesional
            'full_name' => ['required_if:role,'.Role::PROFESSIONAL, 'nullable', 'string', 'max:255'],
            'headline' => ['nullable', 'string', 'max:255'],

            // Empresa
            'trade_name' => ['required_if:role,'.Role::COMPANY, 'nullable', 'string', 'max:255'],
            'tax_id' => ['required_if:role,'.Role::COMPANY, 'nullable', 'string', 'max:255', 'unique:companies,tax_id'],
        ];
    }
}
