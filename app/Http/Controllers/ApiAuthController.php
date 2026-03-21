<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ApiAuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $employee = Employee::where('email', $credentials['email'])->first();

        if (! $employee || ! Hash::check($credentials['password'], $employee->password)) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 401);
        }

        $plainToken = Str::random(80);
        $employee->api_token = hash('sha256', $plainToken);
        $employee->save();

        return response()->json([
            'token_type' => 'Bearer',
            'access_token' => $plainToken,
            'employee' => [
                'id' => $employee->id,
                'email' => $employee->email,
                'first_name' => $employee->first_name,
                'last_name' => $employee->last_name,
                'permission_level' => $employee->permission_level,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $employee = $request->user('api');

        if (! $employee) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $employee->api_token = null;
        $employee->save();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user('api'));
    }
}
