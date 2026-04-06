<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\PerformanceReview;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PerformanceReviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_can_create_self_review_via_api(): void
    {
        $employee = Employee::factory()->staff()->create();

        $payload = [
            'employee_id' => $employee->id,
            'cycle' => '2026 H1',
            'strengths' => 'Great collaborator',
            'rating' => 4,
        ];

        $response = $this->actingAs($employee, 'api')
            ->postJson('/api/performance-reviews', $payload);

        $response->assertCreated()
            ->assertJsonPath('reviewer_id', $employee->id)
            ->assertJsonPath('employee_id', $employee->id)
            ->assertJsonPath('status', 'draft');

        $this->assertDatabaseHas('performance_reviews', [
            'employee_id' => $employee->id,
            'reviewer_id' => $employee->id,
            'cycle' => '2026 H1',
        ]);
    }

    public function test_employee_cannot_create_review_for_other_employee(): void
    {
        [$staff, $other] = Employee::factory()->staff()->count(2)->create();

        $response = $this->actingAs($staff, 'api')->postJson('/api/performance-reviews', [
            'employee_id' => $other->id,
            'cycle' => '2026 H1',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseCount('performance_reviews', 0);
    }

    public function test_manager_can_complete_review(): void
    {
        $manager = Employee::factory()->manager()->create();
        $staff = Employee::factory()->staff()->create();
        $review = PerformanceReview::factory()->create([
            'employee_id' => $staff->id,
            'reviewer_id' => $manager->id,
            'status' => 'in_review',
        ]);

        $payload = [
            'rating' => 5,
            'strengths' => 'Outstanding delivery',
            'areas_for_improvement' => 'Time management',
            'goals_next_period' => 'Lead new project',
        ];

        $response = $this->actingAs($manager, 'api')
            ->postJson("/api/performance-reviews/{$review->id}/complete", $payload);

        $response->assertOk()
            ->assertJsonPath('status', 'completed')
            ->assertJsonPath('rating', 5);

        $this->assertDatabaseHas('performance_reviews', [
            'id' => $review->id,
            'status' => 'completed',
            'rating' => 5,
        ]);
    }

    public function test_index_scopes_results_for_employee(): void
    {
        $staff = Employee::factory()->staff()->create();
        $other = Employee::factory()->staff()->create();

        PerformanceReview::factory()->create(['employee_id' => $staff->id, 'reviewer_id' => $staff->id]);
        PerformanceReview::factory()->create(['employee_id' => $other->id, 'reviewer_id' => $other->id]);

        $response = $this->actingAs($staff, 'api')->getJson('/api/performance-reviews');

        $response->assertOk();
        $data = $response->json('data');
        $this->assertCount(1, $data, 'Only own review should be returned for staff');
        $this->assertEquals($staff->id, $data[0]['employee_id']);
    }
}
