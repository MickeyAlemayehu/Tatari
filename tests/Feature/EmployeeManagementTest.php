<?php

namespace Tests\Feature;

use App\Models\Employee;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmployeeManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_employee(): void
    {
        $admin = Employee::factory()->manager()->create([
            'permission_level' => 10,
            'permission_override' => ['manage_employees' => true],
        ]);

        $payload = [
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'email' => 'jane@example.com',
            'password' => 'Password123!',
            'position' => 'HRBP',
            'permission_level' => 4,
        ];

        $response = $this->actingAs($admin, 'api')->postJson('/api/employees', $payload);

        $response->assertCreated()
            ->assertJsonPath('email', 'jane@example.com');

        $this->assertDatabaseHas('employees', [
            'email' => 'jane@example.com',
            'permission_level' => 4,
        ]);
    }

    public function test_staff_cannot_create_employee(): void
    {
        $staff = Employee::factory()->staff()->create();

        $response = $this->actingAs($staff, 'api')->postJson('/api/employees', [
            'first_name' => 'A',
            'last_name' => 'B',
            'email' => 'new@example.com',
            'password' => 'Password123!',
            'position' => 'Analyst',
            'permission_level' => 2,
        ]);

        $response->assertForbidden();
        $this->assertDatabaseMissing('employees', ['email' => 'new@example.com']);
    }

    public function test_admin_can_deactivate_employee(): void
    {
        $admin = Employee::factory()->manager()->create([
            'permission_override' => ['manage_employees' => true],
        ]);
        $target = Employee::factory()->staff()->create(['status' => 'active']);

        $response = $this->actingAs($admin, 'api')->postJson("/api/employees/{$target->id}/deactivate");

        $response->assertOk();
        $this->assertDatabaseHas('employees', [
            'id' => $target->id,
            'status' => 'inactive',
        ]);
    }
}
