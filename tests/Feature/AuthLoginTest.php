<?php

namespace Tests\Feature;

use App\Models\Employee;
use Database\Seeders\EmployeeSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_validates_credentials_against_database(): void
    {
        $this->seed(EmployeeSeeder::class);

        $this->postJson('/api/login', [
            'email' => 'staff@tatari.local',
            'password' => 'wrong-password',
        ])
            ->assertUnauthorized()
            ->assertJsonPath('message', 'Invalid credentials.');

        $response = $this->postJson('/api/login', [
            'email' => 'staff@tatari.local',
            'password' => 'Password123!',
        ]);

        $response->assertOk()
            ->assertJsonPath('employee.email', 'staff@tatari.local')
            ->assertJsonPath('employee.permission_level', 1)
            ->assertJsonPath('employee.portal', 'employee')
            ->assertJsonStructure(['access_token', 'employee' => ['effective_permissions', 'landing_path']]);

        $token = $response->json('access_token');
        $this->assertNotEmpty($token);

        $this->getJson('/api/me', [
            'Authorization' => 'Bearer '.$token,
        ])
            ->assertOk()
            ->assertJsonPath('email', 'staff@tatari.local');
    }

    public function test_login_rejects_unknown_email(): void
    {
        $this->postJson('/api/login', [
            'email' => 'nobody@tatari.local',
            'password' => 'Password123!',
        ])
            ->assertUnauthorized()
            ->assertJsonPath('message', 'Invalid credentials.');
    }

    public function test_inactive_employee_cannot_login(): void
    {
        Employee::factory()->create([
            'email' => 'inactive@tatari.local',
            'password' => 'Password123!',
            'status' => 'inactive',
            'permission_level' => 1,
        ]);

        $this->postJson('/api/login', [
            'email' => 'inactive@tatari.local',
            'password' => 'Password123!',
        ])
            ->assertForbidden();
    }

    public function test_admin_example_com_can_login_after_seed(): void
    {
        $this->seed(EmployeeSeeder::class);

        $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'Password123!',
        ])
            ->assertOk()
            ->assertJsonPath('employee.email', 'admin@example.com')
            ->assertJsonPath('employee.portal', 'admin');
    }

    public function test_password_is_verified_with_bcrypt_hash_in_database(): void
    {
        $employee = Employee::factory()->create([
            'email' => 'hash-check@tatari.local',
            'password' => 'Password123!',
            'permission_level' => 1,
        ]);

        $employee->refresh();
        $this->assertTrue(Hash::check('Password123!', $employee->password));

        $this->postJson('/api/login', [
            'email' => 'hash-check@tatari.local',
            'password' => 'Password123!',
        ])->assertOk();
    }
}
