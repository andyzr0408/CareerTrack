<?php

namespace Database\Factories;

use App\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Role>
 */
class RoleFactory extends Factory
{
    protected $model = Role::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->word(),
        ];
    }

    public function admin(): static
    {
        return $this->state(fn () => ['name' => Role::ADMIN]);
    }

    public function professional(): static
    {
        return $this->state(fn () => ['name' => Role::PROFESSIONAL]);
    }

    public function company(): static
    {
        return $this->state(fn () => ['name' => Role::COMPANY]);
    }
}
