<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobOffer extends Model
{
    use HasFactory;

    public const MODALITIES = ['remote', 'onsite', 'hybrid'];

    // Ciclo de vida (empresa)
    public const STATUS_ACTIVE = 'active';
    public const STATUS_PAUSED = 'paused';

    // Moderación (administrador)
    public const MODERATION_PENDING = 'pending';
    public const MODERATION_APPROVED = 'approved';
    public const MODERATION_BLOCKED = 'blocked';

    protected $fillable = [
        'company_id',
        'title',
        'modality',
        'location',
        'salary_range',
        'status',
        'moderation_status',
    ];

    /** Ofertas visibles para los profesionales: activas y aprobadas. */
    public function scopePublished($query)
    {
        return $query->where('status', self::STATUS_ACTIVE)
            ->where('moderation_status', self::MODERATION_APPROVED);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /** Habilidades requeridas (pivote job_offer_skill). */
    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class, 'job_offer_skill', 'job_offer_id', 'skill_id');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    /** Candidatos que se postularon (pivote applications). */
    public function applicants(): BelongsToMany
    {
        return $this->belongsToMany(ProfessionalProfile::class, 'applications', 'job_offer_id', 'professional_id')
            ->withPivot('status', 'applied_at');
    }
}
