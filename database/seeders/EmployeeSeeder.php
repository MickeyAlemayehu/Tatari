<?php

namespace Database\Seeders;

use App\Models\Employee;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('Password123!');

        Employee::updateOrCreate(
            ['email' => 'admin@tatari.local'],
            [
                'first_name' => 'System',
                'last_name' => 'Admin',
                'position' => 'HR Director',
                'password' => $password,
                'permission_level' => 10,
                'permission_override' => [
                    'manage_payroll' => true,
                    'approve_leave' => true,
                ],
                'revoked_permissions' => [],
                'must_change_password' => false,
                'status' => 'active',
            ]
        );

        Employee::updateOrCreate(
            ['email' => 'manager@tatari.local'],
            [
                'first_name' => 'Maria',
                'last_name' => 'Manager',
                'position' => 'HR Manager',
                'password' => $password,
                'permission_level' => 6,
                'permission_override' => [
                    'manage_payroll' => true,
                ],
                'revoked_permissions' => [],
                'must_change_password' => false,
                'status' => 'active',
            ]
        );

        Employee::updateOrCreate(
            ['email' => 'staff@tatari.local'],
            [
                'first_name' => 'Sarah',
                'last_name' => 'Staff',
                'position' => 'HR Assistant',
                'password' => $password,
                'permission_level' => 3,
                'permission_override' => [],
                'revoked_permissions' => [],
                'must_change_password' => false,
                'status' => 'active',
            ]
        );

        Employee::updateOrCreate(
            ['email' => 'revoked@tatari.local'],
            [
                'first_name' => 'Ryan',
                'last_name' => 'Revoked',
                'position' => 'Payroll Officer',
                'password' => $password,
                'permission_level' => 7,
                'permission_override' => [],
                'revoked_permissions' => ['manage_payroll'],
                'must_change_password' => false,
                'status' => 'active',
            ]
        );

        Employee::updateOrCreate(
            ['email' => 'override@tatari.local'],
            [
                'first_name' => 'Olivia',
                'last_name' => 'Override',
                'position' => 'HR Intern',
                'password' => $password,
                'permission_level' => 2,
                'permission_override' => [
                    'manage_payroll' => true,
                ],
                'revoked_permissions' => [],
                'must_change_password' => false,
                'status' => 'active',
            ]
        );
    }
}
