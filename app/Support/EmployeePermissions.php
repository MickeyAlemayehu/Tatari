<?php

namespace App\Support;

use App\Models\Employee;

class EmployeePermissions
{
    public static function grantedOverrides(Employee $employee): array
    {
        $permissions = [];

        foreach ([$employee->permission_override ?? [], $employee->custom_override ?? []] as $override) {
            foreach ($override as $key => $value) {
                if (is_int($key) && is_string($value)) {
                    $permissions[] = $value;
                    continue;
                }

                if (is_string($key) && $value === true) {
                    $permissions[] = $key;
                }
            }
        }

        return array_values(array_unique($permissions));
    }

    public static function revokedPermissions(Employee $employee): array
    {
        return array_values(array_filter(
            $employee->revoked_permissions ?? [],
            fn ($permission) => is_string($permission)
        ));
    }

    public static function levelConfig(int $level): array
    {
        return config("permission_levels.levels.{$level}", []);
    }

    public static function levelName(int $level): string
    {
        return self::levelConfig($level)['name'] ?? 'Unknown';
    }

    public static function permissionsForLevel(int $level): array
    {
        return self::levelConfig($level)['permissions'] ?? [];
    }

    public static function normalizeLevel(int $level): int
    {
        $max = (int) config('permission_levels.max_level', 3);
        $default = (int) config('permission_levels.default_level', 1);

        if ($level < 1) {
            return $default;
        }

        if ($level > $max) {
            return $max;
        }

        return $level;
    }

    public static function effectivePermissions(Employee $employee): array
    {
        $level = self::normalizeLevel((int) $employee->permission_level);
        $granted = array_unique(array_merge(
            self::permissionsForLevel($level),
            self::grantedOverrides($employee)
        ));

        return array_values(array_diff($granted, self::revokedPermissions($employee)));
    }

    public static function resolvePortal(Employee $employee): ?string
    {
        if ($employee->hasPermission('access_admin_portal')) {
            return 'admin';
        }

        if ($employee->hasPermission('access_hr_portal')) {
            return 'hr';
        }

        if ($employee->hasPermission('access_employee_portal')) {
            return 'employee';
        }

        return null;
    }

    public static function landingPath(Employee $employee): string
    {
        $portal = self::resolvePortal($employee);
        $level = self::normalizeLevel((int) $employee->permission_level);

        if ($portal === 'admin') {
            return config('permission_levels.levels.3.landing_path', '/admin/dashboard');
        }

        if ($portal === 'hr') {
            return config('permission_levels.levels.2.landing_path', '/hr/dashboard');
        }

        return config("permission_levels.levels.{$level}.landing_path", '/employee/dashboard');
    }

    public static function toAuthArray(Employee $employee): array
    {
        $employee->loadMissing('department:id,name');
        $level = self::normalizeLevel((int) $employee->permission_level);

        return [
            'id' => $employee->id,
            'email' => $employee->email,
            'first_name' => $employee->first_name,
            'last_name' => $employee->last_name,
            'position' => $employee->position,
            'department_id' => $employee->department_id,
            'permission_level' => $level,
            'level_name' => self::levelName($level),
            'permission_override' => $employee->permission_override,
            'revoked_permissions' => $employee->revoked_permissions,
            'status' => $employee->status,
            'department' => $employee->department ? [
                'id' => $employee->department->id,
                'name' => $employee->department->name,
            ] : null,
            'effective_permissions' => self::effectivePermissions($employee),
            'portal' => self::resolvePortal($employee),
            'landing_path' => self::landingPath($employee),
        ];
    }
}
