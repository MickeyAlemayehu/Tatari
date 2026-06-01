<?php

/**
 * Predefined permission levels (1 = lowest). New employees default to level 1.
 * Overrides and revoked_permissions on the employee record adjust effective access.
 */
return [
    'default_level' => 1,
    'max_level' => 3,

    'levels' => [
        1 => [
            'name' => 'Employee',
            'permissions' => [
                'access_employee_portal',
            ],
            'landing_path' => '/employee/dashboard',
        ],
        2 => [
            'name' => 'HR',
            'permissions' => [
                'access_employee_portal',
                'access_hr_portal',
                'manage_employees',
                'manage_departments',
                'manage_recruitment',
                'approve_leave',
                'manage_leave',
                'performance_create',
                'performance_evaluate',
                'manage_performance_reviews',
                'manage_performance',
            ],
            'landing_path' => '/hr/dashboard',
        ],
        3 => [
            'name' => 'Administrator',
            'permissions' => [
                'access_employee_portal',
                'access_hr_portal',
                'access_admin_portal',
                'manage_employees',
                'manage_departments',
                'manage_recruitment',
                'approve_leave',
                'manage_leave',
                'performance_create',
                'performance_evaluate',
                'manage_performance_reviews',
                'manage_performance',
            ],
            'landing_path' => '/admin/dashboard',
        ],
    ],
];
