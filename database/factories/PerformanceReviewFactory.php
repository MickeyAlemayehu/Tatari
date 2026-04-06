<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\PerformanceReview;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PerformanceReview>
 */
class PerformanceReviewFactory extends Factory
{
    protected $model = PerformanceReview::class;

    public function definition(): array
    {
        $employee = Employee::factory()->create();
        $reviewer = Employee::factory()->manager()->create();

        return [
            'employee_id' => $employee->id,
            'reviewer_id' => $reviewer->id,
            'cycle' => $this->faker->randomElement(['2026 H1', '2026 Annual', 'Q2 2026']),
            'status' => 'draft',
            'rating' => null,
            'strengths' => $this->faker->sentence(6),
            'areas_for_improvement' => $this->faker->sentence(6),
            'goals_next_period' => $this->faker->sentence(6),
            'due_date' => $this->faker->dateTimeBetween('now', '+3 months'),
        ];
    }
}
