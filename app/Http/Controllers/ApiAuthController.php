<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Support\EmployeePermissions;
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

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request): JsonResponse
    {
        $employee = $request->user('api');
        $employee->load('department:id,name');

        return response()->json(EmployeePermissions::toAuthArray($employee));
    }
}
