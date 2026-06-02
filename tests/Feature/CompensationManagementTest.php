<?php

namespace Tests\Feature;

use App\Models\Compensation;
use App\Models\Employee;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CompensationManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_payroll_manager_can_create_compensation(): void
    {
        $manager = Employee::factory()->manager()->create([
            'permission_override' => ['manage_payroll' => true],
        ]);
        $employee = Employee::factory()->staff()->create();

        $response = $this->actingAs($manager, 'api')->postJson('/api/compensations', [
            'employee_id' => $employee->id,
            'basic_salary' => 7500,
            'housing_allowance' => 500,
            'transport_allowance' => 200,
            'other_allowances' => 100,
            'currency' => 'USD',
            'effective_from' => '2026-01-01',
        ]);

        $response->assertCreated()
            ->assertJsonPath('employee_id', $employee->id)
            ->assertJsonPath('basicSalary', 7500)
            ->assertJsonPath('status', 'active');

        $this->assertDatabaseHas('compensations', [
            'employee_id' => $employee->id,
            'basic_salary' => 7500,
            'status' => 'active',
        ]);
    }

    public function test_new_active_compensation_deactivates_previous(): void
    {
        $manager = Employee::factory()->manager()->create([
            'permission_override' => ['manage_payroll' => true],
        ]);
        $employee = Employee::factory()->staff()->create();

        $old = Compensation::create([
            'employee_id' => $employee->id,
            'basic_salary' => 6000,
            'housing_allowance' => 0,
            'transport_allowance' => 0,
            'other_allowances' => 0,
            'currency' => 'USD',
            'effective_from' => '2025-01-01',
            'status' => 'active',
        ]);

        $this->actingAs($manager, 'api')->postJson('/api/compensations', [
            'employee_id' => $employee->id,
            'basic_salary' => 8000,
            'currency' => 'USD',
            'effective_from' => '2026-06-01',
        ])->assertCreated();

        $this->assertDatabaseHas('compensations', [
            'id' => $old->id,
            'status' => 'inactive',
        ]);

        $this->assertEquals(1, Compensation::where('employee_id', $employee->id)->where('status', 'active')->count());
    }

    public function test_staff_cannot_manage_compensations(): void
    {
        $staff = Employee::factory()->staff()->create();
        $employee = Employee::factory()->staff()->create();

        $this->actingAs($staff, 'api')->postJson('/api/compensations', [
            'employee_id' => $employee->id,
            'basic_salary' => 5000,
            'currency' => 'USD',
            'effective_from' => '2026-01-01',
        ])->assertForbidden();
    }

    public function test_forbidden_response_is_json_even_without_accept_header(): void
    {
        $staff = Employee::factory()->staff()->create();
        $employee = Employee::factory()->staff()->create();

        $response = $this->actingAs($staff, 'api')->post('/api/compensations', [
            'employee_id' => $employee->id,
            'basic_salary' => 5000,
            'currency' => 'USD',
            'effective_from' => '2026-01-01',
        ]);

        $response->assertForbidden();
        $this->assertStringContainsString('application/json', $response->headers->get('content-type') ?? '');
        $this->assertIsString($response->json('message'));
    }

    public function test_can_list_compensations_for_employee(): void
    {
        $manager = Employee::factory()->manager()->create([
            'permission_override' => ['manage_payroll' => true],
        ]);
        $employee = Employee::factory()->staff()->create();

        Compensation::create([
            'employee_id' => $employee->id,
            'basic_salary' => 5000,
            'housing_allowance' => 0,
            'transport_allowance' => 0,
            'other_allowances' => 0,
            'currency' => 'USD',
            'effective_from' => '2026-01-01',
            'status' => 'active',
        ]);

        $this->actingAs($manager, 'api')
            ->getJson("/api/employees/{$employee->id}/compensations")
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }
}
