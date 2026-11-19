# API de CareerTrack

Contrato entre el backend (Laravel, `backend/routes/api.php`) y el frontend (React). Las rutas por tipo de usuario están explicadas en [`rutas.md`](rutas.md); aquí están los parámetros y las respuestas.

## Convenciones

- **Base:** `http://localhost:8000/api` (en el frontend, variable `VITE_API_URL`).
- **Cabeceras:** `Accept: application/json`. Con sesión, `Authorization: Bearer <token>` (Postman) o la cookie `ct_token` (navegador).
- **Autenticación:** Laravel Sanctum con tokens de API. `login` y `register` devuelven el token en el JSON y además lo guardan en la cookie `ct_token` (httpOnly, SameSite=Lax, 7 días). El frontend solo usa la cookie: `fetch(..., { credentials: 'include' })`; el middleware `AuthenticateFromCookie` la convierte en `Authorization: Bearer`. Frontend y API deben usar el mismo host (`localhost` con `localhost`, no `127.0.0.1`). `logout` borra la cookie.
- **Respuestas de un recurso:** `{ "data": { ... } }`.
- **Listas paginadas:** `{ "data": [...], "links": {...}, "meta": { "current_page", "last_page", "per_page", "total", "from", "to" } }`. Se piden con `?page=2&per_page=6`.
- **Errores:**
  - `401` `{ "message": "Unauthenticated." }`: sin token o token inválido.
  - `403` `{ "message": "..." }`: rol equivocado o cuenta desactivada.
  - `404` `{ "message": "..." }`: no existe o no es tuyo.
  - `409` `{ "message": "..." }`: duplicado (ya te postulaste).
  - `422` `{ "message": "...", "errors": { "campo": ["mensaje"] } }`: validación.

## Recursos

**User** `{ id, email, role: "admin"|"professional"|"company", status: "active"|"inactive", name, created_at }`. En `/me`, `login` y `register` incluye además `professional` o `company`.

**Professional** `{ id, full_name, headline, cv: null | { name, url }, skills: ["PHP", ...], applications_count?, favorites_count? }`

**Company** `{ id, trade_name, tax_id, stats? }`. En `GET /company`, `stats` = `{ total_offers, live_offers, applications_received, accepted }`.

**JobOffer** `{ id, title, modality: "remote"|"onsite"|"hybrid", location: string|null, salary_range, status: "active"|"paused", moderation_status: "pending"|"approved"|"blocked", created_at, days_ago, company?: { id, trade_name }, skills?: ["PHP", ...], applications_count?, pending_applications_count?, saved?: boolean, application?: null | { id, status, applied_at } }`

**Application** `{ id, status: "pending"|"reviewed"|"accepted"|"rejected", applied_at, days_ago, offer?: JobOffer, professional?: Professional }`

**Skill** `{ id, name }`

Equivalencias con el frontend anterior: `salary` = `salary_range`, `daysAgo` = `days_ago`, `moderation` = `moderation_status`, `company` = `company.trade_name`.

## Rutas públicas

| Método | Ruta | Cuerpo / parámetros | Respuesta |
|---|---|---|---|
| POST | `/register` | `role` (`professional`\|`company`), `email`, `password` (mín. 8); profesional: `full_name`, `headline?`; empresa: `trade_name`, `tax_id` | `201` `{ token, user }` |
| POST | `/login` | `email`, `password`, `role?` | `200` `{ token, user }`. `422` si las credenciales o el `role` no coinciden (`errors.email`). `403` si la cuenta está desactivada. |
| GET | `/skills` | | `{ data: [Skill] }` (catálogo completo, sin paginar) |

## Con sesión (cualquier rol)

| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/me` | `{ data: User + professional\|company }` |
| POST | `/logout` | `200` `{ message }`. Revoca el token actual. |
| PATCH | `/me/deactivate` | `200` `{ message }`. Baja lógica y revoca los tokens. |

## Profesional (`role = professional`)

| Método | Ruta | Cuerpo / parámetros | Respuesta |
|---|---|---|---|
| GET | `/job-offers` | `page`, `per_page` (1-50, def. 6), `search`, `modality`, `skills[]` (nombres; la oferta debe pedirlas todas), `sort` (`recent` def. \| `match`) | Lista paginada de JobOffer publicadas (activas y aprobadas) con `company`, `skills`, `saved` y `application`. `match` ordena por skills en común con el profesional. |
| GET | `/job-offers/{id}` | | `{ data: JobOffer }`. `404` si no está publicada. |
| GET | `/profile/stats` | | `{ data: { total_applications, favorites, applications_by_status: { pending, reviewed, accepted, rejected }, applications_by_modality: { remote, onsite, hybrid } } }` (todas las claves siempre presentes, con 0). Alimenta los gráficos de pastel. |
| GET | `/profile` | | `{ data: Professional }` con contadores |
| PUT | `/profile` | `full_name`, `headline?` | `{ data: Professional }` |
| POST | `/profile/cv` | multipart, campo `cv` (PDF, máx. 5 MB) | `{ data: Professional }` |
| PUT | `/profile/skills` | `skills`: arreglo de nombres del catálogo | `{ data: Professional }` |
| GET | `/applications` | `page`, `per_page` (def. 6) | Lista paginada de Application con `offer` (+ `company`, `skills`), la más reciente primero |
| POST | `/job-offers/{id}/applications` | | `201` `{ data: Application }`. `422` si no hay CV. `409` si ya se postuló. `404` si la oferta no está publicada. |
| GET | `/favorites` | `page`, `per_page` (def. 6) | Lista paginada de JobOffer guardadas (`saved: true`) |
| POST | `/job-offers/{id}/favorite` | | `200` `{ message }` (no falla si ya estaba guardada) |
| DELETE | `/job-offers/{id}/favorite` | | `204` |

## Empresa (`role = company`)

| Método | Ruta | Cuerpo / parámetros | Respuesta |
|---|---|---|---|
| GET | `/company/stats` | | `{ data: { total_applications, applications_by_status, offers_by_state: { live, paused, pending, blocked } } }` (claves siempre presentes, con 0; los estados de oferta son excluyentes). Alimenta los gráficos de pastel. |
| GET | `/company` | | `{ data: Company }` con `stats` |
| PUT | `/company` | `trade_name`, `tax_id` | `{ data: Company }` |
| GET | `/company/job-offers` | `page`, `per_page` (def. 6) | Lista paginada de sus JobOffer en cualquier estado, con `skills`, `applications_count` y `pending_applications_count` |
| POST | `/company/job-offers` | `title`, `modality`, `location` (obligatoria si no es remota), `salary_range`, `skills` (mín. 1, nombres) | `201` `{ data: JobOffer }`, con `moderation_status = pending` |
| PUT | `/company/job-offers/{id}` | los mismos campos | `{ data: JobOffer }` |
| PATCH | `/company/job-offers/{id}/status` | `status` (`active`\|`paused`) | `{ data: JobOffer }` |
| DELETE | `/company/job-offers/{id}` | | `204`. Borra también sus postulaciones. |
| GET | `/company/job-offers/{id}/applications` | `page`, `per_page` (def. 6) | Lista paginada de Application con `professional` (skills y cv) |
| PATCH | `/company/applications/{id}` | `status` (`pending`\|`reviewed`\|`accepted`\|`rejected`) | `{ data: Application }` |

Una empresa solo ve y modifica lo suyo; lo ajeno responde `404`.

## Administrador (`role = admin`)

| Método | Ruta | Cuerpo / parámetros | Respuesta |
|---|---|---|---|
| GET | `/admin/stats` | | `{ data: { offers: { pending, approved, blocked }, applications, users, skills } }` |
| GET | `/admin/job-offers` | `page`, `per_page` (def. 8), `moderation_status` (omitido = todas), `search` (cargo o empresa) | Lista paginada de JobOffer con `company` y `skills`, la más reciente primero |
| PATCH | `/admin/job-offers/{id}/moderation` | `moderation_status` (`approved`\|`blocked`) | `{ data: JobOffer }` |
| GET | `/admin/users` | `page`, `per_page` (def. 8), `role`, `search` (correo) | Lista paginada de User |
| PATCH | `/admin/users/{id}/status` | `status` (`active`\|`inactive`) | `{ data: User }`. `403` si intenta desactivarse a sí mismo. |
| POST | `/admin/skills` | `name` (único) | `201` `{ data: Skill }` |
| PUT | `/admin/skills/{id}` | `name` (único) | `{ data: Skill }` |
| DELETE | `/admin/skills/{id}` | | `204` |

## Cuentas de prueba (clave `password`)

`admin@careertrack.test`, `empresa@careertrack.test`, `profesional@careertrack.test`, `inactivo@careertrack.test` (desactivada: el login responde `403`).
