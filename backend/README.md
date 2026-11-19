# CareerTrack: backend (Laravel)

## Puesta en marcha
```bash
cd backend
composer install
composer require laravel/sanctum   # solo la primera vez: instala la autenticación de la API
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan storage:link           # para que se puedan abrir los currículums subidos
php artisan serve                  # API en http://localhost:8000/api
```
`composer require laravel/sanctum` modifica `composer.json` y `composer.lock`; hay que commitear ambos.
No ejecutes `php artisan install:api`: la tabla `personal_access_tokens` ya tiene su migración en el proyecto.
## Cuentas de prueba (clave: `password`)
| Correo | Tipo |
|---|---|
| `admin@careertrack.test` | Administrador |
| `empresa@careertrack.test` | Empresa (TechVentures Inc., con ofertas en cada estado) |
| `profesional@careertrack.test` | Profesional (con skills, una postulación y un favorito) |
| `inactivo@careertrack.test` | Profesional dado de baja (no debe poder entrar) |

Además se generan 5 empresas y 15 profesionales aleatorios con ofertas, postulaciones y favoritos.

## Pruebas
```bash
php artisan test
```

## API
Autenticación con Laravel Sanctum. El token viaja en la cookie httpOnly `ct_token` (el middleware `AuthenticateFromCookie` la convierte en Bearer); Postman puede seguir usando `Authorization: Bearer`. Para depurar, ver [`docs/xdebug.md`](../docs/xdebug.md). Cada ruta valida con un Form Request (`app/Http/Requests`), responde con un API Resource (`app/Http/Resources`) y las listas van paginadas (`?page=` y `?per_page=`). Las rutas están en `routes/api.php`.

## Documentación
Contrato de la API (parámetros, respuestas, paginación): `docs/api.md`. Modelo de datos y rutas por tipo de usuario: `docs/modelo-datos.md` y `docs/rutas.md`, en la carpeta `docs/` de la raíz del repositorio.

## Modelo de datos
`roles`, `users`, `professional_profiles`, `companies`, `job_offers`, `skills`,
`professional_skill`, `job_offer_skill`, `applications`, `favorites`.

Estados de `job_offers`:
- `status` (empresa): `active`, `paused`
- `moderation_status` (administrador): `pending`, `approved`, `blocked`
- `JobOffer::published()` devuelve las ofertas activas y aprobadas.

`users.status`: `active`, `inactive` (baja lógica).
