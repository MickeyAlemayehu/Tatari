<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Department;
use App\Models\Employee;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DepartmentManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_manager_can_list_departments(): void
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
            'permission_override' => ['manage_employees' => true],
        ]);
        Employee::factory()->staff()->create(['department_id' => $department->id]);

        $response = $this->actingAs($manager, 'api')->getJson('/api/departments');

        $response->assertOk()
            ->assertJsonPath('data.0.name', 'Engineering')
            ->assertJsonPath('data.0.employeeCount', 2)
            ->assertJsonPath('data.0.manager', trim("{$manager->first_name} {$manager->last_name}"));
    }

    public function test_manager_can_create_department_without_explicit_company_when_one_exists(): void
    {
        Company::create([
            'company_name' => 'Acme',
            'email' => 'acme@example.com',
            'phone' => '123',
            'expiration_date' => now()->addYear()->toDateString(),
        ]);

        $manager = Employee::factory()->manager()->create([
            'permission_override' => ['manage_employees' => true],
        ]);

        $response = $this->actingAs($manager, 'api')->postJson('/api/departments', [
            'name' => 'Finance',
            'description' => 'Handles payroll and reporting',
        ]);

        $response->assertCreated()
            ->assertJsonPath('name', 'Finance')
            ->assertJsonPath('employeeCount', 0);

        $this->assertDatabaseHas('departments', ['name' => 'Finance']);
    }

    public function test_department_with_employees_cannot_be_deleted(): void
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
            'permission_override' => ['manage_employees' => true],
        ]);
        Employee::factory()->staff()->create(['department_id' => $department->id]);

        $response = $this->actingAs($manager, 'api')->deleteJson("/api/departments/{$department->id}");

        $response->assertStatus(409);
        $this->assertDatabaseHas('departments', ['id' => $department->id]);
    }
}
