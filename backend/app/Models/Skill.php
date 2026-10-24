<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Skill extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    public function professionals(): BelongsToMany
    {
        return $this->belongsToMany(ProfessionalProfile::class, 'professional_skill', 'skill_id', 'professional_id');
    }

    public function jobOffers(): BelongsToMany
    {
        return $this->belongsToMany(JobOffer::class, 'job_offer_skill', 'skill_id', 'job_offer_id');
    }
}
