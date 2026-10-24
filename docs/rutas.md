# Rutas de CareerTrack por tipo de usuario

> Solo definición: estas rutas **no están implementadas todavía**. Sirven como contrato entre el frontend (React) y el backend (Laravel) y se construirán en las siguientes ramas.

Hay tres tipos de usuario (tabla `roles`): **profesional**, **empresa** y **administrador**, más el visitante sin sesión. Las rutas de la API van bajo el prefijo `/api`. Una cuenta con `status = inactive` (baja lógica) no puede iniciar sesión.

## 1. Visitante (sin sesión)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` (pantalla) | Pantalla de inicio de sesión. |
| GET | `/registro` (pantalla) | Registro dinámico: el formulario cambia según elijas profesional o empresa. |
| POST | `/api/register` | Crea el usuario con su rol y su perfil (profesional o empresa) en una sola operación. El administrador no se registra aquí; lo crea el seeder. |
| POST | `/api/login` | Inicia sesión y devuelve el token. Rechaza las cuentas inactivas. |
| GET | `/api/skills` | Lista de skills para los formularios de registro y de ofertas. |

## 2. Todos los usuarios con sesión

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/logout` | Cierra la sesión y revoca el token. |
| GET | `/api/me` | Datos del usuario autenticado, su rol y su perfil. |
| PATCH | `/api/me/deactivate` | Baja lógica de la propia cuenta (`status = inactive`). No borra el historial. |

## 3. Profesional (`role = professional`)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/dashboard` (pantalla) | Panel con las ofertas recomendadas. |
| GET | `/api/job-offers` | Ofertas visibles (activas y aprobadas), con filtros por modalidad, ubicación y skills. |
| GET | `/api/job-offers/{id}` | Detalle de una oferta. |
| GET | `/api/profile` | Ver su perfil profesional. |
| PUT | `/api/profile` | Editar nombre completo y titular. |
| POST | `/api/profile/cv` | Subir o reemplazar su currículum (modal de CV). |
| PUT | `/api/profile/skills` | Reemplazar sus skills (un profesional puede tener muchas). |
| GET | `/api/applications` | Ver sus postulaciones y su estado. |
| POST | `/api/job-offers/{id}/applications` | Postularse a una oferta (solo una vez por oferta). |
| GET | `/api/favorites` | Ver las ofertas guardadas. |
| POST | `/api/job-offers/{id}/favorite` | Guardar una oferta en favoritos. |
| DELETE | `/api/job-offers/{id}/favorite` | Quitar una oferta de favoritos. |

## 4. Empresa (`role = company`)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/empresa` (pantalla) | Panel con sus vacantes y las postulaciones recibidas. |
| GET | `/api/company` | Ver los datos de su empresa. |
| PUT | `/api/company` | Editar nombre comercial e identificación fiscal. |
| GET | `/api/company/job-offers` | Listar sus ofertas en cualquier estado. |
| POST | `/api/company/job-offers` | Publicar una oferta. Nace con `moderation_status = pending` hasta que el administrador la apruebe. |
| PUT | `/api/company/job-offers/{id}` | Editar una oferta propia, incluidas las skills requeridas. |
| PATCH | `/api/company/job-offers/{id}/status` | Pausar o reactivar la oferta (`active` / `paused`). |
| DELETE | `/api/company/job-offers/{id}` | Eliminar una oferta propia. |
| GET | `/api/company/job-offers/{id}/applications` | Ver los postulantes de una oferta. |
| PATCH | `/api/company/applications/{id}` | Cambiar el estado de una postulación (`reviewed`, `accepted`, `rejected`). |

Una empresa solo puede ver y modificar lo que le pertenece.

## 5. Administrador (`role = admin`)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/admin` (pantalla) | Backoffice de control de calidad. |
| GET | `/api/admin/job-offers` | Todas las ofertas, con filtro por `moderation_status` (cola de revisión). |
| PATCH | `/api/admin/job-offers/{id}/moderation` | Aprobar o bloquear una oferta (`approved` / `blocked`). |
| GET | `/api/admin/users` | Listar usuarios, con filtros por rol y estado. |
| PATCH | `/api/admin/users/{id}/status` | Activar o desactivar cualquier cuenta. |
| GET | `/api/admin/stats` | Métricas generales (usuarios, ofertas, postulaciones). |
| POST | `/api/admin/skills` | Crear una skill del catálogo. |
| PUT | `/api/admin/skills/{id}` | Editar una skill. |
| DELETE | `/api/admin/skills/{id}` | Eliminar una skill. |

## Resumen de acceso (middleware)

| Grupo | Middleware | Quién entra |
|---|---|---|
| Públicas | ninguno | Cualquiera |
| Con sesión | `auth:sanctum` + cuenta activa | Cualquier rol |
| Profesional | `auth:sanctum` + `role:professional` | Solo profesionales |
| Empresa | `auth:sanctum` + `role:company` | Solo empresas |
| Administrador | `auth:sanctum` + `role:admin` | Solo administradores |

Las pantallas del frontend (`/dashboard`, `/empresa`, `/admin`) deben redirigir al inicio de sesión cuando no haya sesión o cuando el rol no coincida.
