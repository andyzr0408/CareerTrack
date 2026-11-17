<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\ListRequest;
use App\Models\Role;
use Illuminate\Validation\Rule;

class ListUsersRequest extends ListRequest
{
    protected int $defaultPerPage = 8;

    public function rules(): array
    {
        return [
            ...parent::rules(),
            'role' => ['sometimes', 'nullable', Rule::in([Role::ADMIN, Role::PROFESSIONAL, Role::COMPANY])],
            'search' => ['sometimes', 'nullable', 'string', 'max:100'],
        ];
    }
}
