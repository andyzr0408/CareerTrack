<?php

/*
| CORS: permite que el frontend (React, en otro puerto) llame a la API.
| Los orígenes permitidos se cambian con FRONTEND_URL (separados por coma).
*/
return [
    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_filter(array_map(
        'trim',
        explode(',', env('FRONTEND_URL', 'http://localhost:5173,http://127.0.0.1:5173')),
    ))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // La API usa tokens Bearer, no cookies.
    'supports_credentials' => false,
];
