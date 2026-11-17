<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Skill extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    /**
     * Ids de las skills con esos nombres (el frontend envía nombres, la base guarda ids).
     *
     * @param  array<int, string>  $names
     * @return array<int, int>
     */
    public static function idsFor(array $names): array
    {
        return static::whereIn('name', $names)->pluck('id')->all();
    }

    public function professionals(): BelongsToMany
    {
        return $this->belongsToMany(ProfessionalProfile::class, 'professional_skill', 'skill_id', 'professional_id');
    }

    public function jobOffers(): BelongsToMany
    {
        return $this->belongsToMany(JobOffer::class, 'job_offer_skill', 'skill_id', 'job_offer_id');
    }
}
