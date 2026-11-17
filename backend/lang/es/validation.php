<?php

/*
| Mensajes de validación en español para las reglas que usa la API.
| Las reglas que no estén aquí caen al inglés del framework.
*/
return [
    'array' => ':Attribute debe ser una lista.',
    'between' => [
        'numeric' => ':Attribute debe estar entre :min y :max.',
        'string' => ':Attribute debe tener entre :min y :max caracteres.',
    ],
    'distinct' => ':Attribute tiene un valor repetido.',
    'email' => ':Attribute debe ser un correo electrónico válido.',
    'exists' => 'El valor elegido en :attribute no existe.',
    'file' => ':Attribute debe ser un archivo.',
    'in' => 'El valor elegido en :attribute no es válido.',
    'integer' => ':Attribute debe ser un número entero.',
    'max' => [
        'array' => ':Attribute no puede tener más de :max elementos.',
        'file' => ':Attribute no puede pesar más de :max KB.',
        'string' => ':Attribute no puede tener más de :max caracteres.',
    ],
    'mimes' => ':Attribute debe ser un archivo de tipo: :values.',
    'min' => [
        'array' => ':Attribute debe tener al menos :min elementos.',
        'numeric' => ':Attribute debe ser al menos :min.',
        'string' => ':Attribute debe tener al menos :min caracteres.',
    ],
    'present' => ':Attribute debe estar presente.',
    'required' => ':Attribute es obligatorio.',
    'required_if' => ':Attribute es obligatorio.',
    'required_unless' => ':Attribute es obligatorio.',
    'string' => ':Attribute debe ser texto.',
    'unique' => 'Ya existe un registro con ese valor de :attribute.',
    'uploaded' => 'No se pudo subir :attribute.',

    'custom' => [
        'email' => [
            'unique' => 'Ya existe una cuenta con ese correo electrónico.',
        ],
        'tax_id' => [
            'unique' => 'Esa identificación fiscal ya está registrada.',
        ],
        'name' => [
            'unique' => 'Esa skill ya existe en el catálogo.',
        ],
        'skills' => [
            'min' => 'Elige al menos una skill.',
        ],
        'location' => [
            'required_unless' => 'Indica la ciudad de trabajo.',
        ],
    ],

    'attributes' => [
        'email' => 'el correo electrónico',
        'password' => 'la contraseña',
        'role' => 'el tipo de cuenta',
        'full_name' => 'el nombre completo',
        'headline' => 'el titular',
        'trade_name' => 'el nombre comercial',
        'tax_id' => 'la identificación fiscal',
        'title' => 'el cargo',
        'modality' => 'la modalidad',
        'location' => 'la ciudad',
        'salary_range' => 'el salario',
        'skills' => 'las skills',
        'skills.*' => 'la skill',
        'status' => 'el estado',
        'moderation_status' => 'el estado de moderación',
        'name' => 'el nombre',
        'cv' => 'el currículum',
        'search' => 'la búsqueda',
        'per_page' => 'el tamaño de página',
        'page' => 'la página',
        'sort' => 'el orden',
    ],
];
