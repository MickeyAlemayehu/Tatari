<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Compensation;
use App\Models\Employee;
use App\Models\Payroll;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Symfony\Component\HttpFoundation\Response;

class PayrollController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Payroll::query()
            ->with(['employee.department', 'company'])
            ->latest('year')
            ->latest('month');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->integer('company_id'));
        }

        $groups = $query->get()
            ->groupBy(fn (Payroll $payroll) => "{$payroll->year}-{$payroll->month}")
            ->map(fn (Collection $rows) => $this->periodPayload($rows))
            ->values();

        return response()->json(['data' => $groups]);
    }

    public function summary(): JsonResponse
    {
        $periods = Payroll::query()->get()->groupBy(fn (Payroll $payroll) => "{$payroll->year}-{$payroll->month}");
        $current = $periods->first();

        return response()->json([
            'totalEmployees' => Employee::where('status', 'active')->count(),
            'currentPeriodNetPay' => $current ? round($current->sum('net_salary'), 2) : 0,
            'currentPeriodEmployees' => $current ? $current->count() : 0,
            'totalPayrollThisMonth' => Payroll::where('year', now()->year)->where('month', now()->month)->sum('net_salary'),
            'averagePayroll' => $periods->count() ? round($periods->map(fn ($rows) => $rows->sum('net_salary'))->avg(), 2) : 0,
        ]);
    }

    public function show(Payroll $payroll): JsonResponse
    {
        return response()->json($this->payrollPayload($payroll->load(['employee.department', 'company', 'approver']), true));
    }

    public function period(Request $request): JsonResponse
    {
        $data = $request->validate([
            'year' => ['required', 'integer'],
            'month' => ['required', 'integer', 'between:1,12'],
            'company_id' => ['nullable', 'integer', 'exists:companies,id'],
        ]);

        $rows = Payroll::query()
            ->with(['employee.department', 'company', 'approver'])
            ->where('year', $data['year'])
            ->where('month', $data['month'])
            ->when(isset($data['company_id']), fn ($query) => $query->where('company_id', $data['company_id']))
            ->orderBy('employee_id')
            ->get();

        return response()->json($this->periodPayload($rows, true));
    }

    public function generate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'month' => ['required', 'integer', 'between:1,12'],
            'year' => ['required', 'integer'],
            'company_id' => ['nullable', 'integer', 'exists:companies,id'],
            'include_bonuses' => ['sometimes', 'boolean'],
            'include_allowances' => ['sometimes', 'boolean'],
            'auto_deductions' => ['sometimes', 'boolean'],
            'unpaid_days' => ['sometimes', 'integer', 'min:0'],
        ]);

        $companyId = $data['company_id'] ?? Company::query()->orderBy('id')->value('id');
        if (! $companyId) {
            return response()->json(['message' => 'Create a company before generating payroll.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $employees = Employee::query()
            ->where('status', 'active')
            ->whereHas('department', fn ($query) => $query->where('company_id', $companyId))
            ->with('department')
            ->get();

        $results = [];

        foreach ($employees as $employee) {
            $compensation = Compensation::query()
                ->where('employee_id', $employee->id)
                ->where('status', 'active')
                ->latest('effective_from')
                ->first();

            if (! $compensation) {
                continue;
            }

            $allowances = ($data['include_allowances'] ?? true)
                ? $compensation->housing_allowance + $compensation->transport_allowance + $compensation->other_allowances
                : 0;
            $bonuses = ($data['include_bonuses'] ?? true) ? 0 : 0;
            $unpaidDays = (int) ($data['unpaid_days'] ?? 0);
            $unpaidAmount = round(($compensation->basic_salary / 30) * $unpaidDays, 2);
            $gross = $compensation->basic_salary + $allowances + $bonuses;
            $deductions = ($data['auto_deductions'] ?? true) ? round($gross * 0.12, 2) : 0;
            $net = $gross - $deductions - $unpaidAmount;

            $results[] = Payroll::updateOrCreate(
                [
                    'employee_id' => $employee->id,
                    'company_id' => $companyId,
                    'year' => $data['year'],
                    'month' => $data['month'],
                ],
                [
                    'basic_salary' => $compensation->basic_salary,
                    'total_allowances' => $allowances,
                    'bonuses' => $bonuses,
                    'deductions' => $deductions,
                    'unpaid_leave_days' => $unpaidDays,
                    'unpaid_leave_amount' => $unpaidAmount,
                    'gross_salary' => $gross,
                    'net_salary' => $net,
                    'status' => 'draft',
                    'generated_at' => now(),
                    'approved_by' => null,
                    'approved_at' => null,
                    'rejection_remarks' => null,
                ]
            )->load(['employee.department', 'company']);
        }

        return response()->json([
            'message' => 'Payroll generated as draft.',
            'data' => collect($results)->map(fn (Payroll $payroll) => $this->payrollPayload($payroll)),
        ], Response::HTTP_CREATED);
    }

    public function approve(Request $request, Payroll $payroll): JsonResponse
    {
        $approver = $request->user('api') ?? $request->user();

        $payroll->update([
            'status' => 'approved',
            'approved_by' => $approver?->id,
            'approved_at' => now(),
            'rejection_remarks' => null,
        ]);

        return response()->json($this->payrollPayload($payroll->fresh()->load(['employee.department', 'company', 'approver']), true));
    }

    public function reject(Request $request, Payroll $payroll): JsonResponse
    {
        $data = $request->validate([
            'remarks' => ['nullable', 'string', 'min:3', 'required_without:reason'],
            'reason' => ['nullable', 'string', 'min:3', 'required_without:remarks'],
        ]);

        $payroll->update([
            'status' => 'rejected',
            'rejection_remarks' => $data['remarks'] ?? $data['reason'],
        ]);

        return response()->json($this->payrollPayload($payroll->fresh()->load(['employee.department', 'company', 'approver']), true));
    }

    public function myPayslips(Request $request): JsonResponse
    {
        $employee = $request->user('api') ?? $request->user();

        return response()->json(Payroll::query()
            ->with(['employee.department', 'company'])
            ->where('employee_id', $employee->id)
            ->latest('year')
            ->latest('month')
            ->paginate($request->integer('per_page', 15))
            ->through(fn (Payroll $payroll) => $this->payslipPayload($payroll)));
    }

    public function payslip(Request $request, Payroll $payroll): JsonResponse
    {
        $employee = $request->user('api') ?? $request->user();

        if ($payroll->employee_id !== $employee->id && ! $employee->hasPermission('manage_payroll')) {
            abort(Response::HTTP_FORBIDDEN, 'Not allowed to view this payslip.');
        }

        return response()->json($this->payslipPayload($payroll->load(['employee.department', 'company'])));
    }

    private function periodPayload(Collection $rows, bool $includeRows = false): array
    {
        $first = $rows->first();

        if (! $first) {
            return [
                'id' => null,
                'name' => 'No payroll period',
                'employeeCount' => 0,
                'totalAmount' => 0,
                'deductions' => 0,
                'netPay' => 0,
                'employees' => [],
            ];
        }

        $payload = [
            'id' => $first->id,
            'year' => $first->year,
            'month' => $first->month,
            'name' => date('F Y', mktime(0, 0, 0, $first->month, 1, $first->year)).' Payroll',
            'status' => $this->periodStatus($rows),
            'employeeCount' => $rows->count(),
            'totalAmount' => round($rows->sum('gross_salary'), 2),
            'deductions' => round($rows->sum('deductions') + $rows->sum('unpaid_leave_amount'), 2),
            'netPay' => round($rows->sum('net_salary'), 2),
            'startDate' => sprintf('%d-%02d-01', $first->year, $first->month),
            'endDate' => date('Y-m-t', strtotime(sprintf('%d-%02d-01', $first->year, $first->month))),
            'payDate' => date('Y-m-t', strtotime(sprintf('%d-%02d-01', $first->year, $first->month))),
        ];

        if ($includeRows) {
            $payload['employees'] = $rows->map(fn (Payroll $payroll) => $this->payrollPayload($payroll, true))->values();
        }

        return $payload;
    }

    private function periodStatus(Collection $rows): string
    {
        if ($rows->every(fn (Payroll $payroll) => $payroll->status === 'approved')) {
            return 'approved';
        }

        if ($rows->contains(fn (Payroll $payroll) => $payroll->status === 'rejected')) {
            return 'draft';
        }

        return $rows->contains(fn (Payroll $payroll) => $payroll->status === 'draft') ? 'draft' : 'processing';
    }

    private function payrollPayload(Payroll $payroll, bool $includeDetails = false): array
    {
        $employee = $payroll->employee;
        $allowances = [
            'housing' => round((float) $payroll->total_allowances, 2),
            'transport' => 0,
            'meal' => 0,
        ];

        $payload = [
            'id' => $payroll->id,
            'employeeId' => 'EMP'.str_pad((string) $payroll->employee_id, 3, '0', STR_PAD_LEFT),
            'employeeName' => $employee ? trim("{$employee->first_name} {$employee->last_name}") : null,
            'department' => $employee?->department?->name,
            'position' => $employee?->position,
            'year' => $payroll->year,
            'month' => $payroll->month,
            'baseSalary' => round((float) $payroll->basic_salary, 2),
            'allowances' => $allowances,
            'bonuses' => round((float) $payroll->bonuses, 2),
            'grossPay' => round((float) $payroll->gross_salary, 2),
            'deductions' => [
                'tax' => round((float) $payroll->deductions, 2),
                'insurance' => 0,
                'pension' => 0,
                'other' => round((float) $payroll->unpaid_leave_amount, 2),
            ],
            'totalDeductions' => round((float) $payroll->deductions + (float) $payroll->unpaid_leave_amount, 2),
            'netPay' => round((float) $payroll->net_salary, 2),
            'status' => $payroll->status,
            'rejectionRemarks' => $payroll->rejection_remarks,
        ];

        if ($includeDetails) {
            $payload['approvedBy'] = $payroll->approver ? trim("{$payroll->approver->first_name} {$payroll->approver->last_name}") : null;
            $payload['approvedAt'] = $payroll->approved_at;
        }

        return $payload;
    }

    private function payslipPayload(Payroll $payroll): array
    {
        $base = $this->payrollPayload($payroll, true);

        return [
            ...$base,
            'payPeriod' => date('F Y', mktime(0, 0, 0, $payroll->month, 1, $payroll->year)),
            'payDate' => date('Y-m-t', strtotime(sprintf('%d-%02d-01', $payroll->year, $payroll->month))),
            'paymentMethod' => 'Bank Transfer',
            'workingDays' => 22,
            'leaveDays' => $payroll->unpaid_leave_days,
            'totalEarnings' => $base['grossPay'],
            'totalDeductions' => $base['totalDeductions'],
            'netPay' => $base['netPay'],
            'company' => $payroll->company?->company_name,
        ];
    }
}
