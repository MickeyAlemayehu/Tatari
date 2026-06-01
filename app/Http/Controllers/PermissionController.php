<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Employee;
use App\Support\EmployeePermissions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PermissionController extends Controller
{
    public function updatePermissionLevel(Request $request, Employee $employee)
    {
        $validator = Validator::make($request->all(), [
            'permission_level' => 'required|integer|min:1|max:3',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $employee->permission_level = $request->permission_level;
        $employee->save();

        $request->attributes->set('skip_audit_log', true);
        AuditLog::record(
            action: 'Updated permission level',
            module: 'Permissions',
            description: "Changed permission level to {$request->permission_level} for {$employee->first_name} {$employee->last_name}",
            employee: $request->user(),
            status: 'success'
        );

        return response()->json([
            'message' => 'Permission level updated successfully',
            'employee' => [
                'id' => $employee->id,
                'email' => $employee->email,
                'first_name' => $employee->first_name,
                'last_name' => $employee->last_name,
                'permission_level' => $employee->permission_level,
                'level_name' => EmployeePermissions::levelName($employee->permission_level),
                'custom_override' => $employee->custom_override ?? [],
                'revoked_permissions' => $employee->revoked_permissions ?? [],
                'effective_permissions' => EmployeePermissions::effectivePermissions($employee),
            ],
        ]);
    }

    public function grantPermission(Request $request, Employee $employee)
    {
        $validator = Validator::make($request->all(), [
            'permission' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $customOverride = $employee->custom_override ?? [];
        $revokedPermissions = $employee->revoked_permissions ?? [];

        $changed = false;

        if (!in_array($request->permission, $customOverride, true)) {
            $customOverride[] = $request->permission;
            $employee->custom_override = $customOverride;
            $changed = true;
        }

        if (in_array($request->permission, $revokedPermissions, true)) {
            $revokedPermissions = array_values(array_filter($revokedPermissions, fn($p) => $p !== $request->permission));
            $employee->revoked_permissions = $revokedPermissions;
            $changed = true;
        }

        if ($changed) {
            $employee->save();

            $request->attributes->set('skip_audit_log', true);
            AuditLog::record(
                action: 'Granted permission',
                module: 'Permissions',
                description: "Granted '{$request->permission}' permission to {$employee->first_name} {$employee->last_name}",
                employee: $request->user(),
                status: 'success'
            );
        }

        return response()->json([
            'message' => 'Permission granted successfully',
            'employee' => [
                'id' => $employee->id,
                'email' => $employee->email,
                'first_name' => $employee->first_name,
                'last_name' => $employee->last_name,
                'permission_level' => $employee->permission_level,
                'level_name' => EmployeePermissions::levelName($employee->permission_level),
                'custom_override' => $employee->custom_override,
                'revoked_permissions' => $employee->revoked_permissions ?? [],
                'effective_permissions' => EmployeePermissions::effectivePermissions($employee),
            ],
        ]);
    }

    public function revokePermission(Request $request, Employee $employee)
    {
        $validator = Validator::make($request->all(), [
            'permission' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $revokedPermissions = $employee->revoked_permissions ?? [];
        $customOverride = $employee->custom_override ?? [];

        $changed = false;

        if (!in_array($request->permission, $revokedPermissions, true)) {
            $revokedPermissions[] = $request->permission;
            $employee->revoked_permissions = $revokedPermissions;
            $changed = true;
        }

        if (in_array($request->permission, $customOverride, true)) {
            $customOverride = array_values(array_filter($customOverride, fn($p) => $p !== $request->permission));
            $employee->custom_override = $customOverride;
            $changed = true;
        }

        if ($changed) {
            $employee->save();

            $request->attributes->set('skip_audit_log', true);
            AuditLog::record(
                action: 'Revoked permission',
                module: 'Permissions',
                description: "Revoked '{$request->permission}' permission from {$employee->first_name} {$employee->last_name}",
                employee: $request->user(),
                status: 'warning'
            );
        }

        return response()->json([
            'message' => 'Permission revoked successfully',
            'employee' => [
                'id' => $employee->id,
                'email' => $employee->email,
                'first_name' => $employee->first_name,
                'last_name' => $employee->last_name,
                'permission_level' => $employee->permission_level,
                'level_name' => EmployeePermissions::levelName($employee->permission_level),
                'custom_override' => $employee->custom_override ?? [],
                'revoked_permissions' => $employee->revoked_permissions,
                'effective_permissions' => EmployeePermissions::effectivePermissions($employee),
            ],
        ]);
    }

    public function removeGrantedPermission(Request $request, Employee $employee, string $permission)
    {
        $permission = urldecode($permission);

        $customOverride = $employee->custom_override ?? [];
        $customOverride = array_values(array_filter($customOverride, fn($p) => $p !== $permission));

        $employee->custom_override = $customOverride;
        $employee->save();

        return response()->json([
            'message' => 'Granted permission removed successfully',
            'employee' => [
                'id' => $employee->id,
                'email' => $employee->email,
                'first_name' => $employee->first_name,
                'last_name' => $employee->last_name,
                'permission_level' => $employee->permission_level,
                'level_name' => EmployeePermissions::levelName($employee->permission_level),
                'custom_override' => $employee->custom_override,
                'revoked_permissions' => $employee->revoked_permissions ?? [],
                'effective_permissions' => EmployeePermissions::effectivePermissions($employee),
            ],
        ]);
    }

    public function removeRevokedPermission(Request $request, Employee $employee, string $permission)
    {
        $permission = urldecode($permission);

        $revokedPermissions = $employee->revoked_permissions ?? [];
        $revokedPermissions = array_values(array_filter($revokedPermissions, fn($p) => $p !== $permission));

        $employee->revoked_permissions = $revokedPermissions;
        $employee->save();

        return response()->json([
            'message' => 'Revoked permission restored successfully',
            'employee' => [
                'id' => $employee->id,
                'email' => $employee->email,
                'first_name' => $employee->first_name,
                'last_name' => $employee->last_name,
                'permission_level' => $employee->permission_level,
                'level_name' => EmployeePermissions::levelName($employee->permission_level),
                'custom_override' => $employee->custom_override ?? [],
                'revoked_permissions' => $employee->revoked_permissions,
                'effective_permissions' => EmployeePermissions::effectivePermissions($employee),
            ],
        ]);
    }

    public function getAvailablePermissions()
    {
        $allPermissions = [];

        for ($level = 1; $level <= 3; $level++) {
            $permissions = EmployeePermissions::permissionsForLevel($level);
            $allPermissions = array_merge($allPermissions, $permissions);
        }

        // Surface fine-grained sidebar permissions as grantable even if no
        // role config lists them (defensive: future-proofs against config drift).
        $allPermissions = array_merge($allPermissions, [
            'manage_employees',
            'manage_departments',
            'manage_leave',
            'manage_performance',
            'manage_recruitment',
        ]);

        $allPermissions = array_values(array_unique($allPermissions));

        return response()->json([
            'permissions' => $allPermissions,
            'levels' => [
                1 => [
                    'name' => EmployeePermissions::levelName(1),
                    'permissions' => EmployeePermissions::permissionsForLevel(1),
                ],
                2 => [
                    'name' => EmployeePermissions::levelName(2),
                    'permissions' => EmployeePermissions::permissionsForLevel(2),
                ],
                3 => [
                    'name' => EmployeePermissions::levelName(3),
                    'permissions' => EmployeePermissions::permissionsForLevel(3),
                ],
            ],
        ]);
    }
}
