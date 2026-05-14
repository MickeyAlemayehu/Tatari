<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Department;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('Password123!');
        $hrDepartmentId = Department::where('name', 'Human Resources')->value('id');

        Employee::updateOrCreate(
            ['email' => 'admin@tatari.local'],
            [
                'first_name' => 'System',
                'last_name' => 'Admin',
                'position' => 'HR Director',
                'department_id' => $hrDepartmentId,
                'password' => $password,
                'permission_level' => 10,
                'permission_override' => [
                    'manage_payroll' => true,
                    'manage_employees' => true,
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
                'department_id' => $hrDepartmentId,
                'password' => $password,
                'permission_level' => 6,
                'permission_override' => [
                    'manage_payroll' => true,
                    'manage_employees' => true,
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
                'department_id' => $hrDepartmentId,
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
                'department_id' => Department::where('name', 'Finance')->value('id') ?? $hrDepartmentId,
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
                'department_id' => $hrDepartmentId,
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
