<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class DepartmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Department::query()
            ->withCount('employees')
            ->with([
                'manager:id,first_name,last_name',
                'employees' => function ($query) {
                    $query->select('id', 'department_id', 'first_name', 'last_name', 'position', 'permission_level')
                        ->orderByDesc('permission_level')
                        ->orderBy('last_name');
                },
            ])
            ->orderBy('name');

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->integer('company_id'));
        }

        $departments = $query->get()->map(fn (Department $department) => $this->departmentPayload($department));

        return response()->json(['data' => $departments]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => ['sometimes', 'integer', 'exists:companies,id'],
            'name' => [
                'required',
                'string',
                'max:150',
                Rule::unique('departments', 'name')->where(
                    fn ($query) => $query->where('company_id', $request->input('company_id') ?? $this->defaultCompanyId())
                ),
            ],
            'description' => ['nullable', 'string'],
        ]);

        $data['company_id'] ??= $this->defaultCompanyId();

        $department = Department::create($data);

        return response()->json(
            $this->departmentPayload($department->loadCount('employees')->load('employees')),
            Response::HTTP_CREATED
        );
    }

    public function show(Department $department): JsonResponse
    {
        return response()->json(
            $this->departmentPayload($department->loadCount('employees')->load(['employees', 'manager:id,first_name,last_name']))
        );
    }

    public function mine(Request $request): JsonResponse
    {
        $employee = $request->user('api');

        if (! $employee || ! $employee->department_id) {
            return response()->json([
                'message' => 'You are not assigned to a department.',
            ], Response::HTTP_NOT_FOUND);
        }

        $department = Department::query()
            ->with([
                'manager:id,first_name,last_name,position,email',
                'employees' => function ($query) {
                    $query->select('id', 'department_id', 'first_name', 'last_name', 'position', 'email', 'permission_level')
                        ->orderByDesc('permission_level')
                        ->orderBy('last_name');
                },
            ])
            ->withCount('employees')
            ->find($employee->department_id);

        if (! $department) {
            return response()->json([
                'message' => 'Department not found.',
            ], Response::HTTP_NOT_FOUND);
        }

        $manager = $department->manager
            ?? $department->employees->sortByDesc('permission_level')->first();

        return response()->json([
            'id' => $department->id,
            'name' => $department->name,
            'description' => $department->description,
            'employeeCount' => $department->employees_count,
            'manager' => $manager ? [
                'id' => $manager->id,
                'name' => trim("{$manager->first_name} {$manager->last_name}"),
                'position' => $manager->position ?? null,
                'email' => $manager->email ?? null,
            ] : null,
            'team' => $department->employees->map(fn ($member) => [
                'id' => $member->id,
                'first_name' => $member->first_name,
                'last_name' => $member->last_name,
                'position' => $member->position,
                'email' => $member->email,
            ])->values(),
        ]);
    }

    public function update(Request $request, Department $department): JsonResponse
    {
        $data = $request->validate([
            'company_id' => ['sometimes', 'integer', 'exists:companies,id'],
            'name' => [
                'required',
                'string',
                'max:150',
                Rule::unique('departments', 'name')
                    ->where(fn ($query) => $query->where('company_id', $request->input('company_id', $department->company_id)))
                    ->ignore($department->id),
            ],
            'description' => ['required', 'string'],
            'manager_id' => ['nullable', 'integer', 'exists:employees,id'],
        ]);

        $department->update($data);

        return response()->json(
            $this->departmentPayload($department->fresh()->loadCount('employees')->load(['employees', 'manager:id,first_name,last_name']))
        );
    }

    public function destroy(Department $department): JsonResponse
    {
        if ($department->employees()->exists()) {
            return response()->json([
                'message' => 'Cannot delete a department with assigned employees.',
            ], Response::HTTP_CONFLICT);
        }

        $department->delete();

        return response()->json(['message' => 'Department deleted.']);
    }

    private function defaultCompanyId(): int
    {
        $companyId = Company::query()->orderBy('id')->value('id');

        if (! $companyId) {
            abort(Response::HTTP_UNPROCESSABLE_ENTITY, 'Create a company before creating departments.');
        }

        return (int) $companyId;
    }

    private function departmentPayload(Department $department): array
    {
        $manager = $department->manager
            ?? $department->employees->sortByDesc('permission_level')->first();

        return [
            'id' => $department->id,
            'company_id' => $department->company_id,
            'name' => $department->name,
            'description' => $department->description,
            'manager_id' => $department->manager_id,
            'manager' => $manager ? trim("{$manager->first_name} {$manager->last_name}") : null,
            'employeeCount' => $department->employees_count ?? $department->employees()->count(),
            'created_at' => $department->created_at,
            'updated_at' => $department->updated_at,
        ];
    }
}
