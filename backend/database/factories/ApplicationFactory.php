<?php

namespace Database\Factories;

use App\Models\Application;
use App\Models\JobOffer;
use App\Models\ProfessionalProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Application>
 */
class ApplicationFactory extends Factory
{
    protected $model = Application::class;

    public function definition(): array
    {
        return [
            'professional_id' => ProfessionalProfile::factory(),
            'job_offer_id' => JobOffer::factory(),
            'status' => fake()->randomElement(Application::STATUSES),
            'applied_at' => fake()->dateTimeBetween('-30 days', 'now'),
        ];
    }
}
