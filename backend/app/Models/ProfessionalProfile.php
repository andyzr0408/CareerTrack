<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProfessionalProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'full_name',
        'headline',
        'cv_document',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Habilidades del profesional (pivote professional_skill). */
    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class, 'professional_skill', 'professional_id', 'skill_id');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class, 'professional_id');
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class, 'professional_id');
    }

    /** Ofertas a las que se postuló (pivote applications). */
    public function appliedJobOffers(): BelongsToMany
    {
        return $this->belongsToMany(JobOffer::class, 'applications', 'professional_id', 'job_offer_id')
            ->withPivot('status', 'applied_at');
    }

    /** Ofertas guardadas (pivote favorites). */
    public function favoriteJobOffers(): BelongsToMany
    {
        return $this->belongsToMany(JobOffer::class, 'favorites', 'professional_id', 'job_offer_id');
    }
}
