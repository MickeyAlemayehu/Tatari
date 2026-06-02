<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Department;
use Illuminate\Database\Seeder;

class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
        // Plain password — Employee model "hashed" cast hashes once on save.
        $plainPassword = 'Password123!';
        $hrDepartmentId = Department::where('name', 'Human Resources')->value('id');

        Employee::updateOrCreate(
            ['email' => 'admin@tatari.local'],
            [
                'first_name' => 'System',
                'last_name' => 'Admin',
                'position' => 'HR Director',
                'department_id' => $hrDepartmentId,
                'password' => $plainPassword,
                'permission_level' => 3,
                'permission_override' => [],
                'revoked_permissions' => [],
                'must_change_password' => false,
                'status' => 'active',
            ]
        );

        // Common coursework / manual SQL alias (same admin, level 3)
        Employee::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'first_name' => 'Admin',
                'last_name' => 'User',
                'position' => 'Administrator',
                'department_id' => $hrDepartmentId,
                'password' => $plainPassword,
                'permission_level' => 3,
                'permission_override' => [],
                'revoked_permissions' => [],
                'must_change_password' => false,
                'status' => 'active',
            ]
        );

        Employee::updateOrCreate(
            ['email' => 'manager@tatari.local'],
            [
                'first_name' => 'Abebech',
                'last_name' => 'Tadesse',
                'position' => 'HR Manager',
                'department_id' => $hrDepartmentId,
                'password' => $plainPassword,
                'permission_level' => 2,
                'permission_override' => [],
                'revoked_permissions' => [],
                'must_change_password' => false,
                'status' => 'active',
            ]
        );

        Employee::updateOrCreate(
            ['email' => 'staff@tatari.local'],
            [
                'first_name' => 'Selamawit',
                'last_name' => 'Bekele',
                'position' => 'Staff Member',
                'department_id' => $hrDepartmentId,
                'password' => $plainPassword,
                'permission_level' => 1,
                'permission_override' => [],
                'revoked_permissions' => [],
                'must_change_password' => false,
                'status' => 'active',
            ]
        );

        Employee::updateOrCreate(
            ['email' => 'revoked@tatari.local'],
            [
                'first_name' => 'Dawit',
                'last_name' => 'Getachew',
                'position' => 'Payroll Officer',
                'department_id' => Department::where('name', 'Finance')->value('id') ?? $hrDepartmentId,
                'password' => $plainPassword,
                'permission_level' => 2,
                'permission_override' => [],
                'revoked_permissions' => ['manage_payroll'],
                'must_change_password' => false,
                'status' => 'active',
            ]
        );

        Employee::updateOrCreate(
            ['email' => 'override@tatari.local'],
            [
                'first_name' => 'Tigist',
                'last_name' => 'Haile',
                'position' => 'HR Intern',
                'department_id' => $hrDepartmentId,
                'password' => $plainPassword,
                'permission_level' => 1,
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
