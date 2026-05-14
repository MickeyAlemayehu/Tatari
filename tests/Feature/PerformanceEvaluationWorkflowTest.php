<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Department;
use App\Models\Employee;
use App\Models\EvaluationAssignment;
use App\Models\EvaluationPeriod;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PerformanceEvaluationWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_manager_can_create_evaluation_period(): void
    {
        [$company, $department, $manager] = $this->setupCompany();

        $response = $this->actingAs($manager, 'api')->postJson('/api/evaluation-periods', [
            'company_id' => $company->id,
            'name' => '2026 H1 Evaluation',
            'start_date' => '2026-04-01',
            'end_date' => '2026-06-30',
            'status' => 'active',
        ]);

        $response->assertCreated()
            ->assertJsonPath('name', '2026 H1 Evaluation')
            ->assertJsonPath('status', 'active');

        $this->assertDatabaseHas('evaluation_periods', [
            'company_id' => $company->id,
            'name' => '2026 H1 Evaluation',
        ]);
    }

    public function test_manager_can_assign_peer_evaluators(): void
    {
        [$company, $department, $manager] = $this->setupCompany();
        $employee = Employee::factory()->staff()->create(['department_id' => $department->id]);
        $peer = Employee::factory()->staff()->create(['department_id' => $department->id]);
        $period = $this->period($company);

        $response = $this->actingAs($manager, 'api')->postJson('/api/evaluation-assignments/assign-peers', [
            'evaluation_period_id' => $period->id,
            'employee_id' => $employee->id,
            'peer_ids' => [$peer->id],
            'manager_id' => $manager->id,
            'include_self' => true,
        ]);

        $response->assertCreated()
            ->assertJsonPath('message', 'Evaluators assigned.');

        $this->assertDatabaseHas('evaluation_assignments', [
            'evaluation_period_id' => $period->id,
            'employee_id' => $employee->id,
            'evaluator_id' => $peer->id,
            'evaluator_type' => 'peer',
        ]);
        $this->assertDatabaseHas('evaluation_assignments', [
            'evaluation_period_id' => $period->id,
            'employee_id' => $employee->id,
            'evaluator_id' => $employee->id,
            'evaluator_type' => 'self',
        ]);
    }

    public function test_evaluator_can_submit_assignment_and_summary_is_calculated(): void
    {
        [$company, $department, $manager] = $this->setupCompany();
        $employee = Employee::factory()->staff()->create(['department_id' => $department->id]);
        $period = $this->period($company);
        $assignment = EvaluationAssignment::create([
            'evaluation_period_id' => $period->id,
            'employee_id' => $employee->id,
            'evaluator_id' => $employee->id,
            'evaluator_type' => 'self',
            'assigned_by' => $manager->id,
            'assigned_at' => now(),
        ]);

        $response = $this->actingAs($employee, 'api')->postJson("/api/evaluation-assignments/{$assignment->id}/submit", [
            'answers' => [
                ['questionId' => 1, 'rating' => 4],
                ['questionId' => 2, 'rating' => 5],
            ],
            'comments' => 'Strong performance this period.',
        ]);

        $response->assertCreated()
            ->assertJsonPath('score', 4.5)
            ->assertJsonPath('type', 'self');

        $this->assertDatabaseHas('performance_summaries', [
            'employee_id' => $employee->id,
            'evaluation_period_id' => $period->id,
            'self_score' => 4.5,
            'final_score' => 4.5,
        ]);
    }

    public function test_employee_can_see_only_my_assignments(): void
    {
        [$company, $department, $manager] = $this->setupCompany();
        [$employee, $other] = Employee::factory()->staff()->count(2)->create(['department_id' => $department->id]);
        $period = $this->period($company);

        EvaluationAssignment::create([
            'evaluation_period_id' => $period->id,
            'employee_id' => $employee->id,
            'evaluator_id' => $employee->id,
            'evaluator_type' => 'self',
            'assigned_by' => $manager->id,
            'assigned_at' => now(),
        ]);
        EvaluationAssignment::create([
            'evaluation_period_id' => $period->id,
            'employee_id' => $other->id,
            'evaluator_id' => $other->id,
            'evaluator_type' => 'self',
            'assigned_by' => $manager->id,
            'assigned_at' => now(),
        ]);

        $response = $this->actingAs($employee, 'api')->getJson('/api/evaluation-assignments/my');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals($employee->id, $response->json('data.0.evaluator_id'));
    }

    public function test_staff_cannot_create_evaluation_periods(): void
    {
        $staff = Employee::factory()->staff()->create();

        $this->actingAs($staff, 'api')->postJson('/api/evaluation-periods', [
            'name' => 'Blocked',
            'start_date' => '2026-04-01',
            'end_date' => '2026-06-30',
        ])->assertForbidden();
    }

    private function setupCompany(): array
    {
        $company = Company::create([
            'company_name' => 'Acme',
            'email' => 'acme@example.com',
            'phone' => '123',
            'expiration_date' => now()->addYear()->toDateString(),
        ]);

        $department = Department::create([
            'company_id' => $company->id,
            'name' => 'Engineering',
            'description' => 'Builds products',
        ]);

        $manager = Employee::factory()->manager()->create([
            'department_id' => $department->id,
            'permission_override' => [
                'performance_create' => true,
                'performance_evaluate' => true,
            ],
        ]);

        return [$company, $department, $manager];
    }

    private function period(Company $company): EvaluationPeriod
    {
        return EvaluationPeriod::create([
            'company_id' => $company->id,
            'name' => '2026 H1 Evaluation',
            'start_date' => '2026-04-01',
            'end_date' => '2026-06-30',
            'status' => 'active',
        ]);
    }
}
