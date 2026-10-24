<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\JobOffer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<JobOffer>
 */
class JobOfferFactory extends Factory
{
    protected $model = JobOffer::class;

    public function definition(): array
    {
        $min = fake()->numberBetween(5, 20) * 100;

        return [
            'company_id' => Company::factory(),
            'title' => fake()->randomElement([
                'Desarrollador Backend', 'Desarrollador Frontend', 'Desarrollador Full Stack',
                'Analista de Datos', 'Ingeniero DevOps', 'Diseñador UX/UI', 'QA Tester',
            ]),
            'modality' => fake()->randomElement(JobOffer::MODALITIES),
            'location' => fake()->randomElement(['Caracas', 'Bogotá', 'Madrid', null]),
            'salary_range' => '$' . $min . ' - $' . ($min + fake()->numberBetween(2, 10) * 100),
            'status' => JobOffer::STATUS_ACTIVE,
            'moderation_status' => JobOffer::MODERATION_APPROVED,
        ];
    }

    public function paused(): static
    {
        return $this->state(fn () => ['status' => JobOffer::STATUS_PAUSED]);
    }

    public function pending(): static
    {
        return $this->state(fn () => ['moderation_status' => JobOffer::MODERATION_PENDING]);
    }

    public function blocked(): static
    {
        return $this->state(fn () => ['moderation_status' => JobOffer::MODERATION_BLOCKED]);
    }
}
