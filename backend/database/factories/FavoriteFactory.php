<?php

namespace Database\Factories;

use App\Models\Favorite;
use App\Models\JobOffer;
use App\Models\ProfessionalProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Favorite>
 */
class FavoriteFactory extends Factory
{
    protected $model = Favorite::class;

    public function definition(): array
    {
        return [
            'professional_id' => ProfessionalProfile::factory(),
            'job_offer_id' => JobOffer::factory(),
        ];
    }
}
