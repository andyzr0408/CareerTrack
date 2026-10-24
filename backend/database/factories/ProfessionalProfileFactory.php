<?php

namespace Database\Factories;

use App\Models\ProfessionalProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProfessionalProfile>
 */
class ProfessionalProfileFactory extends Factory
{
    protected $model = ProfessionalProfile::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory()->professional(),
            'full_name' => fake()->name(),
            'headline' => fake()->jobTitle(),
            'cv_document' => 'cvs/' . fake()->unique()->uuid() . '.pdf',
        ];
    }

    public function withoutCv(): static
    {
        return $this->state(fn () => ['cv_document' => null]);
    }
}
