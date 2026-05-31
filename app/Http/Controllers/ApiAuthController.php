<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Employee;
use App\Support\EmployeePermissions;
use App\Events\EmployeePasswordChanged;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class ApiAuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $email = strtolower(trim($credentials['email']));
        $employee = Employee::query()->whereRaw('LOWER(email) = ?', [$email])->first();

        if (! $employee || ! Hash::check($credentials['password'], $employee->getAuthPassword())) {
            $request->attributes->set('skip_audit_log', true);
            AuditLog::record(
                action: 'Failed login',
                module: 'Authentication',
                description: "Failed login attempt for email: {$email}",
                employee: $employee,
                status: 'failed',
                metadata: ['email' => $email]
            );

            return response()->json([
                'message' => 'Invalid credentials.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        if ($employee->status === 'inactive') {
            return response()->json([
                'message' => 'This account is inactive. Contact your administrator.',
            ], Response::HTTP_FORBIDDEN);
        }

        if (! EmployeePermissions::resolvePortal($employee)) {
            return response()->json([
                'message' => 'This account has no portal access configured. Contact your administrator.',
            ], Response::HTTP_FORBIDDEN);
        }

        $plainToken = Str::random(80);
        $employee->api_token = hash('sha256', $plainToken);
        $employee->save();

        $request->attributes->set('skip_audit_log', true);
        AuditLog::record(
            action: 'Login',
            module: 'Authentication',
            description: "User logged in successfully",
            employee: $employee,
            status: 'success'
        );

        $employee->load('department:id,name');

        return response()->json([
            'token_type' => 'Bearer',
            'access_token' => $plainToken,
            'employee' => EmployeePermissions::toAuthArray($employee),
            'user' => [
                'id' => $employee->id,
                'name' => trim("{$employee->first_name} {$employee->last_name}"),
                'email' => $employee->email,
            ],
            'permission_level' => EmployeePermissions::normalizeLevel((int) $employee->permission_level),
            'effective_permissions' => EmployeePermissions::effectivePermissions($employee),
            'landing_path' => EmployeePermissions::landingPath($employee),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $employee = $request->user('api');

        if (! $employee) {
            return response()->json(['message' => 'Unauthenticated.'], Response::HTTP_UNAUTHORIZED);
        }

        $employee->api_token = null;
        $employee->save();

        $request->attributes->set('skip_audit_log', true);
        AuditLog::record(
            action: 'Logout',
            module: 'Authentication',
            description: "User logged out",
            employee: $employee,
            status: 'success'
        );

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request): JsonResponse
    {
        $employee = $request->user('api');
        $employee->load('department:id,name');

        return response()->json(EmployeePermissions::toAuthArray($employee));
    }

    public function changePassword(Request $request): JsonResponse
    {
        $employee = $request->user('api');

        if (! $employee) {
            return response()->json(['message' => 'Unauthenticated.'], Response::HTTP_UNAUTHORIZED);
        }

        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8', 'different:current_password'],
        ]);

        if (! Hash::check($data['current_password'], $employee->getAuthPassword())) {
            return response()->json([
                'message' => 'Current password is incorrect.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $employee->password = $data['new_password'];
        $employee->must_change_password = false;
        $employee->save();

        event(new EmployeePasswordChanged($employee));

        $request->attributes->set('skip_audit_log', true);
        AuditLog::record(
            action: 'Password changed',
            module: 'Authentication',
            description: "User changed their password",
            employee: $employee,
            status: 'success'
        );

        return response()->json(['message' => 'Password updated successfully.']);
    }
}
