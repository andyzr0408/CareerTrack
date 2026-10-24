<?php

namespace Database\Factories;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected $model = User::class;

    protected static ?string $password;

    public function definition(): array
    {
        return [
            'role_id' => fn () => Role::firstOrCreate(['name' => Role::PROFESSIONAL])->id,
            'email' => fake()->unique()->safeEmail(),
            'password' => static::$password ??= Hash::make('password'),
            'status' => User::STATUS_ACTIVE,
            'remember_token' => str()->random(10),
        ];
    }

    public function admin(): static
    {
        return $this->state(fn () => [
            'role_id' => Role::firstOrCreate(['name' => Role::ADMIN])->id,
        ]);
    }

    public function professional(): static
    {
        return $this->state(fn () => [
            'role_id' => Role::firstOrCreate(['name' => Role::PROFESSIONAL])->id,
        ]);
    }

    public function company(): static
    {
        return $this->state(fn () => [
            'role_id' => Role::firstOrCreate(['name' => Role::COMPANY])->id,
        ]);
    }

    /** Baja lógica. */
    public function inactive(): static
    {
        return $this->state(fn () => ['status' => User::STATUS_INACTIVE]);
    }
}
