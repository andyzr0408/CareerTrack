# CareerTrack: backend (Laravel)

## Puesta en marcha
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
```
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

## Documentación
Modelo de datos y rutas por tipo de usuario: carpeta `docs/` en la raíz del repositorio.

## Modelo de datos
`roles`, `users`, `professional_profiles`, `companies`, `job_offers`, `skills`,
`professional_skill`, `job_offer_skill`, `applications`, `favorites`.

Estados de `job_offers`:
- `status` (empresa): `active`, `paused`
- `moderation_status` (administrador): `pending`, `approved`, `blocked`
- `JobOffer::published()` devuelve las ofertas activas y aprobadas.

`users.status`: `active`, `inactive` (baja lógica).
