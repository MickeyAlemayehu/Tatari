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
            ->with('department:id,name')
            ->orderBy('last_name')
            ->paginate($request->integer('per_page', 50));

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
            'department_id' => ['sometimes', 'nullable', 'integer', 'exists:departments,id'],
            'manager_id' => ['sometimes', 'nullable', 'integer', 'exists:employees,id'],
            'permission_level' => ['sometimes', 'integer', 'between:1,3'],
            'permission_override' => ['sometimes', 'array'],
            'custom_override' => ['sometimes', 'array'],
            'revoked_permissions' => ['sometimes', 'array'],
            'status' => ['sometimes', 'in:active,inactive'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:32'],
            'date_of_birth' => ['sometimes', 'nullable', 'date'],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
            'city' => ['sometimes', 'nullable', 'string', 'max:100'],
            'state' => ['sometimes', 'nullable', 'string', 'max:100'],
            'zip_code' => ['sometimes', 'nullable', 'string', 'max:20'],
        ]);

        $data['permission_level'] = $data['permission_level'] ?? config('permission_levels.default_level', 1);

        $employee = Employee::create($data);

        return response()->json($employee->load('department:id,name', 'manager:id,first_name,last_name'), Response::HTTP_CREATED);
    }

    public function show(Employee $employee): JsonResponse
    {
        return response()->json($employee->load('department:id,name', 'manager:id,first_name,last_name'));
    }

    public function update(Request $request, Employee $employee): JsonResponse
    {
        $data = $request->validate([
            'first_name' => ['sometimes', 'string', 'max:100'],
            'last_name' => ['sometimes', 'string', 'max:100'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('employees', 'email')->ignore($employee->id)],
            'password' => ['sometimes', 'string', 'min:8'],
            'position' => ['sometimes', 'string', 'max:150'],
            'department_id' => ['sometimes', 'nullable', 'integer', 'exists:departments,id'],
            'manager_id' => ['sometimes', 'nullable', 'integer', 'exists:employees,id'],
            'permission_level' => ['sometimes', 'integer', 'between:1,3'],
            'permission_override' => ['sometimes', 'array'],
            'custom_override' => ['sometimes', 'array'],
            'revoked_permissions' => ['sometimes', 'array'],
            'status' => ['sometimes', 'in:active,inactive'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:32'],
            'date_of_birth' => ['sometimes', 'nullable', 'date'],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
            'city' => ['sometimes', 'nullable', 'string', 'max:100'],
            'state' => ['sometimes', 'nullable', 'string', 'max:100'],
            'zip_code' => ['sometimes', 'nullable', 'string', 'max:20'],
        ]);

        $employee->update($data);

        return response()->json($employee->load('department:id,name', 'manager:id,first_name,last_name'));
    }

    public function deactivate(Employee $employee): JsonResponse
    {
        $employee->update(['status' => 'inactive']);

        return response()->json(['message' => 'Employee deactivated.']);
    }
}
