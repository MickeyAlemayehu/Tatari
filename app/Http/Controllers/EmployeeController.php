<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEmployeeRequest;
use App\Models\AuditLog;
use App\Models\Employee;
use App\Support\EmployeePermissions;
use App\Events\EmployeeCreated;
use App\Events\EmployeeDeactivated;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EmployeeController extends Controller
{
    /** Columns the CSV importer accepts. JSON/array & permission-flag columns are intentionally excluded. */
    private const IMPORT_COLUMNS = [
        'first_name', 'last_name', 'email', 'password', 'position',
        'department_id', 'manager_id', 'permission_level', 'status',
        'phone', 'date_of_birth', 'address', 'city', 'state', 'zip_code',
    ];

    public function index(Request $request): JsonResponse
    {
        $employees = Employee::query()
            ->with('department:id,name')
            ->orderBy('last_name')
            ->paginate($request->integer('per_page', 50));

        $employees->getCollection()->transform(function (Employee $employee) {
            $employee->setAttribute('level_name', EmployeePermissions::levelName((int) $employee->permission_level));
            $employee->setAttribute('effective_permissions', EmployeePermissions::effectivePermissions($employee));
            $employee->setAttribute('custom_override', $employee->custom_override ?? []);
            $employee->setAttribute('revoked_permissions', $employee->revoked_permissions ?? []);
            return $employee;
        });

        return response()->json($employees);
    }

    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['permission_level'] = $data['permission_level'] ?? config('permission_levels.default_level', 1);
        $data['must_change_password'] = true;

        $employee = Employee::create($data);

        event(new EmployeeCreated($employee));

        $request->attributes->set('skip_audit_log', true);
        AuditLog::record(
            action: 'Created employee',
            module: 'Employee Management',
            description: "Created new employee record for {$employee->first_name} {$employee->last_name}",
            employee: $request->user(),
            status: 'success'
        );

        return response()->json(
            $employee->load('department:id,name', 'manager:id,first_name,last_name'),
            Response::HTTP_CREATED
        );
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

        $request->attributes->set('skip_audit_log', true);
        AuditLog::record(
            action: 'Updated employee',
            module: 'Employee Management',
            description: "Updated record for {$employee->first_name} {$employee->last_name}",
            employee: $request->user(),
            status: 'success'
        );

        return response()->json($employee->load('department:id,name', 'manager:id,first_name,last_name'));
    }

    public function deactivate(Employee $employee): JsonResponse
    {
        $employee->update([
            'status' => 'inactive',
            'deactivated_at' => now(),
        ]);

        request()->attributes->set('skip_audit_log', true);
        AuditLog::record(
            action: 'Deactivated employee',
            module: 'Employee Management',
            description: "Deactivated employee {$employee->first_name} {$employee->last_name}",
            employee: request()->user(),
            status: 'success'
        );

        return response()->json(['message' => 'Employee deactivated.']);
    }

    public function importTemplate(): StreamedResponse
    {
        $headers = self::IMPORT_COLUMNS;
        $sample = [
            'Jane', 'Doe', 'jane.doe@example.com', 'ChangeMe123!', 'Software Engineer',
            '1', '', '1', 'active',
            '+1-555-0100', '1990-05-15', '123 Main St', 'Springfield', 'IL', '62701',
        ];

        return response()->streamDownload(function () use ($headers, $sample) {
            $out = fopen('php://output', 'w');
            fputcsv($out, $headers);
            fputcsv($out, $sample);
            fclose($out);
        }, 'employees_import_template.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
        ]);

        $handle = fopen($request->file('file')->getRealPath(), 'r');
        if (! $handle) {
            return response()->json(['message' => 'Unable to read uploaded file.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $header = fgetcsv($handle);
        if (! $header) {
            fclose($handle);
            return response()->json(['message' => 'CSV is empty or missing a header row.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $header = array_map(fn ($h) => strtolower(trim(preg_replace('/^\xEF\xBB\xBF/', '', (string) $h))), $header);
        $rules = StoreEmployeeRequest::rulesFor();
        $allowed = array_flip(self::IMPORT_COLUMNS);

        $imported = 0;
        $failed = 0;
        $errors = [];
        $rowNumber = 1;

        DB::beginTransaction();
        try {
            while (($cells = fgetcsv($handle)) !== false) {
                $rowNumber++;

                if (count(array_filter($cells, fn ($v) => trim((string) $v) !== '')) === 0) {
                    continue;
                }

                $row = [];
                foreach ($header as $i => $col) {
                    if (! isset($allowed[$col])) {
                        continue;
                    }
                    $val = $cells[$i] ?? null;
                    if (is_string($val)) {
                        $val = trim($val);
                        if ($val === '') {
                            $val = null;
                        }
                    }
                    $row[$col] = $val;
                }

                $validator = Validator::make($row, $rules);

                if ($validator->fails()) {
                    foreach ($validator->errors()->messages() as $field => $messages) {
                        foreach ($messages as $message) {
                            $errors[] = [
                                'row' => $rowNumber,
                                'field' => $field,
                                'message' => $message,
                            ];
                        }
                    }
                    $failed++;
                    continue;
                }

                $data = $validator->validated();
                $data['permission_level'] = $data['permission_level'] ?? config('permission_levels.default_level', 1);
                $data['must_change_password'] = true;

                Employee::create($data);
                $imported++;
            }

            DB::commit();

            $request->attributes->set('skip_audit_log', true);
            AuditLog::record(
                action: 'Imported employees',
                module: 'Employee Management',
                description: "Bulk imported {$imported} employee(s)",
                employee: $request->user(),
                status: 'success'
            );
        } catch (\Throwable $e) {
            DB::rollBack();
            fclose($handle);

            return response()->json([
                'message' => 'Import failed: ' . $e->getMessage(),
                'imported' => 0,
                'failed' => $failed,
                'errors' => $errors,
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        fclose($handle);

        return response()->json([
            'imported' => $imported,
            'failed' => $failed,
            'errors' => $errors,
        ]);
    }
}
