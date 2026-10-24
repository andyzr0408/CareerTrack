# CareerTrack: backend (Laravel)

## Puesta en marcha
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
```
Usuario administrador de prueba: `admin@careertrack.test` / `password`.

## Modelo de datos
`roles`, `users`, `professional_profiles`, `companies`, `job_offers`, `skills`,
`professional_skill`, `job_offer_skill`, `applications`, `favorites`.

Estados de `job_offers`:
- `status` (empresa): `active`, `paused`
- `moderation_status` (administrador): `pending`, `approved`, `blocked`
- `JobOffer::published()` devuelve las ofertas activas y aprobadas.

`users.status`: `active`, `inactive` (baja lógica).
