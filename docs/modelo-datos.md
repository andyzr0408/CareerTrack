# Modelo de datos de CareerTrack

```mermaid
erDiagram
    roles {
        BIGINT id PK
        VARCHAR name "admin, professional, company"
    }
    users {
        BIGINT id PK
        BIGINT role_id FK
        VARCHAR email
        VARCHAR password
        ENUM status "active, inactive"
    }
    professional_profiles {
        BIGINT id PK
        BIGINT user_id FK
        VARCHAR full_name
        VARCHAR headline
        VARCHAR cv_document
    }
    companies {
        BIGINT id PK
        BIGINT user_id FK
        VARCHAR trade_name
        VARCHAR tax_id
    }
    job_offers {
        BIGINT id PK
        BIGINT company_id FK
        VARCHAR title
        ENUM modality "remote, onsite, hybrid"
        VARCHAR location
        VARCHAR salary_range
        ENUM status "active, paused"
        ENUM moderation_status "pending, approved, blocked"
    }
    skills {
        BIGINT id PK
        VARCHAR name
    }
    professional_skill {
        BIGINT id PK
        BIGINT professional_id FK
        BIGINT skill_id FK
    }
    job_offer_skill {
        BIGINT id PK
        BIGINT job_offer_id FK
        BIGINT skill_id FK
    }
    applications {
        BIGINT id PK
        BIGINT professional_id FK
        BIGINT job_offer_id FK
        ENUM status "pending, reviewed, accepted, rejected"
        TIMESTAMP applied_at
    }
    favorites {
        BIGINT id PK
        BIGINT professional_id FK
        BIGINT job_offer_id FK
    }

    roles ||--o{ users : "asigna"
    users ||--o| professional_profiles : "tiene"
    users ||--o| companies : "tiene"
    companies ||--o{ job_offers : "publica"
    professional_profiles ||--o{ professional_skill : "domina"
    skills ||--o{ professional_skill : "es dominada en"
    job_offers ||--o{ job_offer_skill : "requiere"
    skills ||--o{ job_offer_skill : "es requerida en"
    professional_profiles ||--o{ applications : "envia"
    job_offers ||--o{ applications : "recibe"
    professional_profiles ||--o{ favorites : "guarda"
    job_offers ||--o{ favorites : "es guardada en"
```

## Correcciones aplicadas
1. **`roles` relacionada a `users`:** el rol deja de ser un ENUM y pasa a ser una tabla con `users.role_id`.
2. **Un profesional tiene muchas skills:** nueva tabla pivote `professional_skill`.
3. **Estados de `job_offers` separados:** `status` (lo controla la empresa: `active`, `paused`) y `moderation_status` (lo controla el administrador: `pending`, `approved`, `blocked`).
4. **Campos que pedían las pantallas:** `professional_profiles.headline` (titular/cargo) y `job_offers.location`.
5. **Integridad:** índices únicos en `applications`, `favorites` y las pivotes de skills, para evitar duplicados (un profesional no se postula dos veces a la misma oferta).
6. **Rendimiento:** índice compuesto `job_offers(status, moderation_status)` e índices en las llaves foráneas de las pivotes.
7. **Baja lógica:** `users.status = inactive` bloquea el acceso sin borrar el historial.
