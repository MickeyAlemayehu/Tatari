<?php

namespace Database\Factories;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Employee>
 */
class EmployeeFactory extends Factory
{
    protected $model = Employee::class;

    public function definition(): array
    {
        return [
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'email' => $this->faker->unique()->safeEmail(),
            'password' => 'Password123!',
            'position' => $this->faker->jobTitle(),
            'permission_level' => $this->faker->numberBetween(1, 3),
            'permission_override' => [],
            'custom_override' => null,
            'revoked_permissions' => [],
            'must_change_password' => false,
            'status' => 'active',
            'remember_token' => Str::random(10),
        ];
    }

    public function manager(): static
    {
        return $this->state(fn () => ['permission_level' => 2]);
    }

    public function staff(): static
    {
        return $this->state(fn () => ['permission_level' => 1]);
    }
}
