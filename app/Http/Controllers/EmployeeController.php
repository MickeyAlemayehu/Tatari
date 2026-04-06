<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class EmployeeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $employees = Employee::query()
            ->select(['id', 'first_name', 'last_name', 'email', 'position', 'permission_level', 'status'])
            ->orderBy('last_name')
            ->paginate(15);

        return response()->json($employees);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', 'unique:employees,email'],
            'password' => ['required', 'string', 'min:8'],
            'position' => ['required', 'string', 'max:150'],
            'permission_level' => ['required', 'integer', 'between:1,10'],
            'permission_override' => ['sometimes', 'array'],
            'revoked_permissions' => ['sometimes', 'array'],
            'status' => ['sometimes', 'in:active,inactive'],
        ]);

        $employee = Employee::create($data);

        return response()->json($employee, Response::HTTP_CREATED);
    }

    public function show(Employee $employee): JsonResponse
    {
        return response()->json($employee);
    }

    public function update(Request $request, Employee $employee): JsonResponse
    {
        $data = $request->validate([
            'first_name' => ['sometimes', 'string', 'max:100'],
            'last_name' => ['sometimes', 'string', 'max:100'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('employees', 'email')->ignore($employee->id)],
            'password' => ['sometimes', 'string', 'min:8'],
            'position' => ['sometimes', 'string', 'max:150'],
            'permission_level' => ['sometimes', 'integer', 'between:1,10'],
            'permission_override' => ['sometimes', 'array'],
            'revoked_permissions' => ['sometimes', 'array'],
            'status' => ['sometimes', 'in:active,inactive'],
        ]);

        $employee->update($data);

        return response()->json($employee);
    }

    public function deactivate(Employee $employee): JsonResponse
    {
        $employee->update(['status' => 'inactive']);

        return response()->json(['message' => 'Employee deactivated.']);
    }
}
