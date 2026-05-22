<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Support\EmployeePermissions;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiAuthPermissionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_returns_effective_permissions_and_landing_path(): void
    {
        $employee = Employee::factory()->create([
            'first_name' => 'Amina',
            'last_name' => 'HR',
            'email' => 'amina@example.com',
            'permission_level' => 2,
            'custom_override' => ['manage_payroll'],
            'revoked_permissions' => ['approve_leave'],
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $employee->email,
            'password' => 'Password123!',
        ]);

        $response->assertOk()
            ->assertJsonPath('user.id', $employee->id)
            ->assertJsonPath('user.name', 'Amina HR')
            ->assertJsonPath('permission_level', 2)
            ->assertJsonPath('landing_path', '/hr/dashboard')
            ->assertJsonFragment(['manage_payroll']);

        $permissions = $response->json('effective_permissions');

        $this->assertContains('access_hr_portal', $permissions);
        $this->assertContains('manage_payroll', $permissions);
        $this->assertNotContains('approve_leave', $permissions);
    }

    public function test_new_employee_defaults_to_level_one(): void
    {
        $employee = Employee::factory()->create([
            'permission_level' => null,
        ]);

        $this->assertSame(1, $employee->permission_level);
        $this->assertSame(['access_employee_portal'], EmployeePermissions::effectivePermissions($employee->fresh()));
    }
}
