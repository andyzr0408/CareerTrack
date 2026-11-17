<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Base de las peticiones que devuelven listas paginadas: ?page= y ?per_page=.
 * Las que tienen filtros la extienden y suman sus reglas.
 */
class ListRequest extends FormRequest
{
    /** Tamaño de página si el cliente no manda per_page. */
    protected int $defaultPerPage = 6;

    protected int $maxPerPage = 50;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'between:1,'.$this->maxPerPage],
        ];
    }

    public function perPage(): int
    {
        return (int) ($this->validated('per_page') ?? $this->defaultPerPage);
    }
}
