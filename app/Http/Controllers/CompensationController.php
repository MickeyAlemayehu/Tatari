<?php

namespace App\Http\Controllers;

use App\Models\Compensation;
use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Symfony\Component\HttpFoundation\Response;

class CompensationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Compensation::query()
            ->with(['employee.department'])
            ->latest('effective_from');

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->integer('employee_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $items = $query->get()->map(fn (Compensation $compensation) => $this->payload($compensation));

        return response()->json(['data' => $items]);
    }

    public function forEmployee(Employee $employee): JsonResponse
    {
        $items = $employee->compensations()
            ->latest('effective_from')
            ->get()
            ->map(fn (Compensation $compensation) => $this->payload($compensation));

        return response()->json(['data' => $items]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);

        if (($data['status'] ?? 'active') === 'active') {
            $this->deactivateActiveForEmployee((int) $data['employee_id'], $data['effective_from']);
        }

        $compensation = Compensation::create($data);

        return response()->json(
            $this->payload($compensation->load('employee.department')),
            Response::HTTP_CREATED
        );
    }

    public function show(Compensation $compensation): JsonResponse
    {
        return response()->json($this->payload($compensation->load('employee.department')));
    }

    public function update(Request $request, Compensation $compensation): JsonResponse
    {
        $data = $this->validated($request, true);

        if (($data['status'] ?? $compensation->status) === 'active' && $compensation->status !== 'active') {
            $this->deactivateActiveForEmployee(
                (int) ($data['employee_id'] ?? $compensation->employee_id),
                $data['effective_from'] ?? $compensation->effective_from?->toDateString(),
                $compensation->id
            );
        }

        $compensation->update($data);

        return response()->json($this->payload($compensation->fresh()->load('employee.department')));
    }

    public function destroy(Compensation $compensation): JsonResponse
    {
        $compensation->update([
            'status' => 'inactive',
            'effective_to' => now()->toDateString(),
        ]);

        return response()->json(['message' => 'Compensation deactivated.']);
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $rules = [
            'employee_id' => [$partial ? 'sometimes' : 'required', 'integer', 'exists:employees,id'],
            'basic_salary' => [$partial ? 'sometimes' : 'required', 'numeric', 'min:0'],
            'housing_allowance' => ['sometimes', 'numeric', 'min:0'],
            'transport_allowance' => ['sometimes', 'numeric', 'min:0'],
            'other_allowances' => ['sometimes', 'numeric', 'min:0'],
            'currency' => [$partial ? 'sometimes' : 'required', 'string', 'max:10'],
            'effective_from' => [$partial ? 'sometimes' : 'required', 'date'],
            'effective_to' => ['nullable', 'date'],
            'status' => ['sometimes', 'string', 'in:active,inactive'],
        ];

        $data = $request->validate($rules);

        if (isset($data['effective_from'], $data['effective_to'])) {
            if (Carbon::parse($data['effective_to'])->lt(Carbon::parse($data['effective_from']))) {
                abort(Response::HTTP_UNPROCESSABLE_ENTITY, 'Effective end date must be on or after start date.');
            }
        }

        $data['housing_allowance'] ??= 0;
        $data['transport_allowance'] ??= 0;
        $data['other_allowances'] ??= 0;
        $data['status'] ??= 'active';

        return $data;
    }

    private function deactivateActiveForEmployee(int $employeeId, string $effectiveFrom, ?int $exceptId = null): void
    {
        $query = Compensation::query()
            ->where('employee_id', $employeeId)
            ->where('status', 'active');

        if ($exceptId) {
            $query->whereKeyNot($exceptId);
        }

        $endDate = Carbon::parse($effectiveFrom)->subDay()->toDateString();

        $query->update([
            'status' => 'inactive',
            'effective_to' => $endDate,
        ]);
    }

    private function payload(Compensation $compensation): array
    {
        $allowances = (float) $compensation->housing_allowance
            + (float) $compensation->transport_allowance
            + (float) $compensation->other_allowances;

        $employee = $compensation->employee;

        return [
            'id' => $compensation->id,
            'employee_id' => $compensation->employee_id,
            'basic_salary' => (float) $compensation->basic_salary,
            'basicSalary' => (float) $compensation->basic_salary,
            'housing_allowance' => (float) $compensation->housing_allowance,
            'housingAllowance' => (float) $compensation->housing_allowance,
            'transport_allowance' => (float) $compensation->transport_allowance,
            'transportAllowance' => (float) $compensation->transport_allowance,
            'other_allowances' => (float) $compensation->other_allowances,
            'otherAllowances' => (float) $compensation->other_allowances,
            'totalAllowances' => round($allowances, 2),
            'grossMonthly' => round((float) $compensation->basic_salary + $allowances, 2),
            'currency' => $compensation->currency,
            'effective_from' => $compensation->effective_from?->toDateString(),
            'effectiveFrom' => $compensation->effective_from?->toDateString(),
            'effective_to' => $compensation->effective_to?->toDateString(),
            'effectiveTo' => $compensation->effective_to?->toDateString(),
            'status' => $compensation->status,
            'employee' => $employee ? [
                'id' => $employee->id,
                'name' => trim("{$employee->first_name} {$employee->last_name}"),
                'department' => $employee->department?->name,
                'position' => $employee->position,
            ] : null,
            'created_at' => $compensation->created_at,
            'updated_at' => $compensation->updated_at,
        ];
    }
}
