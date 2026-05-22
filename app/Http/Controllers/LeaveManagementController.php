<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Employee;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class LeaveManagementController extends Controller
{
    public function types(Request $request): JsonResponse
    {
        $query = LeaveType::query()->where('status', 'active')->orderBy('name');

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->integer('company_id'));
        }

        return response()->json([
            'data' => $query->get()->map(fn (LeaveType $type) => $this->leaveTypePayload($type)),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $query = LeaveRequest::query()
            ->with(['employee.department', 'leaveType', 'approver'])
            ->latest('applied_at');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->integer('employee_id'));
        }

        return response()->json($query->paginate($request->integer('per_page', 15))
            ->through(fn (LeaveRequest $leaveRequest) => $this->leaveRequestPayload($leaveRequest)));
    }

    public function mine(Request $request): JsonResponse
    {
        $employee = $this->employee($request);

        $requests = LeaveRequest::query()
            ->with(['employee.department', 'leaveType', 'approver'])
            ->where('employee_id', $employee->id)
            ->latest('applied_at')
            ->paginate($request->integer('per_page', 15))
            ->through(fn (LeaveRequest $leaveRequest) => $this->leaveRequestPayload($leaveRequest));

        return response()->json($requests);
    }

    public function store(Request $request): JsonResponse
    {
        $employee = $this->employee($request);

        $data = $request->validate([
            'leave_type_id' => ['nullable', 'integer', 'exists:leave_types,id'],
            'leave_type' => ['nullable', 'string', 'max:150'],
            'type' => ['nullable', 'string', 'max:150'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'is_half_day' => ['sometimes', 'boolean'],
            'reason' => ['nullable', 'string', 'max:2000'],
        ]);

        $leaveType = $this->resolveLeaveType($data, $employee);
        $days = $this->requestedDays($data['start_date'], $data['end_date'], (bool) ($data['is_half_day'] ?? false));
        $balance = $this->balanceFor($employee, $leaveType, Carbon::parse($data['start_date'])->year);
        $availableDays = $balance->allocated_days + $balance->carried_forward_days - $balance->used_days - $balance->pending_days;

        if ($days > $availableDays) {
            return response()->json([
                'message' => 'Requested leave exceeds available balance.',
                'available_days' => $availableDays,
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $leaveRequest = LeaveRequest::create([
            'employee_id' => $employee->id,
            'leave_type_id' => $leaveType->id,
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'is_half_day' => (bool) ($data['is_half_day'] ?? false),
            'reason' => $data['reason'] ?? null,
            'status' => 'pending',
            'applied_at' => now(),
        ]);

        $balance->increment('pending_days', $days);

        return response()->json(
            $this->leaveRequestPayload($leaveRequest->load(['employee.department', 'leaveType', 'approver'])),
            Response::HTTP_CREATED
        );
    }

    public function show(Request $request, LeaveRequest $leaveRequest): JsonResponse
    {
        $employee = $this->employee($request);

        if ($leaveRequest->employee_id !== $employee->id && ! $employee->hasPermission('approve_leave')) {
            abort(Response::HTTP_FORBIDDEN, 'Not allowed to view this leave request.');
        }

        return response()->json($this->leaveRequestPayload($leaveRequest->load(['employee.department', 'leaveType', 'approver'])));
    }

    public function approve(Request $request, LeaveRequest $leaveRequest): JsonResponse
    {
        $approver = $this->employee($request);

        if ($leaveRequest->status !== 'pending') {
            return response()->json(['message' => 'Only pending leave requests can be approved.'], Response::HTTP_CONFLICT);
        }

        $days = $this->requestedDays($leaveRequest->start_date, $leaveRequest->end_date, $leaveRequest->is_half_day);
        $balance = $this->balanceFor($leaveRequest->employee, $leaveRequest->leaveType, $leaveRequest->start_date->year);

        $leaveRequest->update([
            'status' => 'approved',
            'approved_by' => $approver->id,
            'approved_at' => now(),
            'rejection_reason' => null,
        ]);

        $balance->update([
            'pending_days' => max(0, $balance->pending_days - $days),
            'used_days' => $balance->used_days + $days,
        ]);

        return response()->json($this->leaveRequestPayload($leaveRequest->fresh()->load(['employee.department', 'leaveType', 'approver'])));
    }

    public function reject(Request $request, LeaveRequest $leaveRequest): JsonResponse
    {
        $approver = $this->employee($request);
        $data = $request->validate([
            'reason' => ['nullable', 'string', 'min:3', 'max:2000', 'required_without:rejection_reason'],
            'rejection_reason' => ['nullable', 'string', 'min:3', 'max:2000', 'required_without:reason'],
        ]);

        if ($leaveRequest->status !== 'pending') {
            return response()->json(['message' => 'Only pending leave requests can be rejected.'], Response::HTTP_CONFLICT);
        }

        $days = $this->requestedDays($leaveRequest->start_date, $leaveRequest->end_date, $leaveRequest->is_half_day);
        $balance = $this->balanceFor($leaveRequest->employee, $leaveRequest->leaveType, $leaveRequest->start_date->year);

        $leaveRequest->update([
            'status' => 'rejected',
            'approved_by' => $approver->id,
            'approved_at' => now(),
            'rejection_reason' => $data['rejection_reason'] ?? $data['reason'],
        ]);

        $balance->update(['pending_days' => max(0, $balance->pending_days - $days)]);

        return response()->json($this->leaveRequestPayload($leaveRequest->fresh()->load(['employee.department', 'leaveType', 'approver'])));
    }

    public function cancel(Request $request, LeaveRequest $leaveRequest): JsonResponse
    {
        $employee = $this->employee($request);

        if ($leaveRequest->employee_id !== $employee->id) {
            abort(Response::HTTP_FORBIDDEN, 'Only the request owner can cancel this leave request.');
        }

        if ($leaveRequest->status !== 'pending') {
            return response()->json(['message' => 'Only pending leave requests can be cancelled.'], Response::HTTP_CONFLICT);
        }

        $days = $this->requestedDays($leaveRequest->start_date, $leaveRequest->end_date, $leaveRequest->is_half_day);
        $balance = $this->balanceFor($employee, $leaveRequest->leaveType, $leaveRequest->start_date->year);

        $leaveRequest->update(['status' => 'cancelled']);
        $balance->update(['pending_days' => max(0, $balance->pending_days - $days)]);

        return response()->json($this->leaveRequestPayload($leaveRequest->fresh()->load(['employee.department', 'leaveType', 'approver'])));
    }

    public function myBalances(Request $request): JsonResponse
    {
        $employee = $this->employee($request);

        return response()->json([
            'data' => $this->balancesForEmployee($employee),
        ]);
    }

    public function balances(Request $request): JsonResponse
    {
        $query = LeaveBalance::query()
            ->with(['employee.department', 'leaveType'])
            ->where('year', $request->integer('year', now()->year))
            ->orderBy('employee_id');

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->integer('employee_id'));
        }

        return response()->json([
            'data' => $query->get()->map(fn (LeaveBalance $balance) => $this->balancePayload($balance)),
        ]);
    }

    public function summary(): JsonResponse
    {
        return response()->json([
            'totalLeaveRequests' => LeaveRequest::count(),
            'pendingLeaveRequests' => LeaveRequest::where('status', 'pending')->count(),
            'approvedLeaveRequests' => LeaveRequest::where('status', 'approved')->count(),
            'rejectedLeaveRequests' => LeaveRequest::where('status', 'rejected')->count(),
            'totalEmployees' => Employee::where('status', 'active')->count(),
        ]);
    }

    private function employee(Request $request): Employee
    {
        return $request->user('api') ?? $request->user();
    }

    private function resolveLeaveType(array $data, Employee $employee): LeaveType
    {
        if (! empty($data['leave_type_id'])) {
            return LeaveType::findOrFail($data['leave_type_id']);
        }

        $name = $data['leave_type'] ?? $data['type'] ?? null;
        if (! $name) {
            abort(Response::HTTP_UNPROCESSABLE_ENTITY, 'Leave type is required.');
        }

        $companyId = $employee->department?->company_id ?? Company::query()->orderBy('id')->value('id');

        $leaveType = LeaveType::query()
            ->where('company_id', $companyId)
            ->where('name', $name)
            ->where('status', 'active')
            ->first();

        if (! $leaveType) {
            abort(Response::HTTP_UNPROCESSABLE_ENTITY, 'Invalid leave type.');
        }

        return $leaveType;
    }

    private function balanceFor(Employee $employee, LeaveType $leaveType, int $year): LeaveBalance
    {
        return LeaveBalance::firstOrCreate(
            [
                'employee_id' => $employee->id,
                'leave_type_id' => $leaveType->id,
                'year' => $year,
            ],
            [
                'allocated_days' => $leaveType->max_days_per_year,
                'used_days' => 0,
                'pending_days' => 0,
                'carried_forward_days' => 0,
            ]
        );
    }

    private function balancesForEmployee(Employee $employee): array
    {
        $companyId = $employee->department?->company_id ?? Company::query()->orderBy('id')->value('id');
        $year = now()->year;

        return LeaveType::query()
            ->where('company_id', $companyId)
            ->where('status', 'active')
            ->orderBy('name')
            ->get()
            ->map(function (LeaveType $leaveType) use ($employee, $year) {
                return $this->balancePayload($this->balanceFor($employee, $leaveType, $year)->load(['employee.department', 'leaveType']));
            })
            ->all();
    }

    private function requestedDays(string|Carbon $startDate, string|Carbon $endDate, bool $isHalfDay = false): int
    {
        if ($isHalfDay) {
            return 1;
        }

        return Carbon::parse($startDate)->diffInDays(Carbon::parse($endDate)) + 1;
    }

    private function leaveTypePayload(LeaveType $type): array
    {
        return [
            'id' => $type->id,
            'company_id' => $type->company_id,
            'name' => $type->name,
            'description' => $type->description,
            'maxDaysPerYear' => $type->max_days_per_year,
            'isPaid' => (bool) $type->is_paid,
            'allowHalfDay' => (bool) $type->allow_half_day,
            'carryForwardAllowed' => (bool) $type->carry_forward_allowed,
            'maxCarryForwardDays' => $type->max_carry_forward_days,
            'status' => $type->status,
        ];
    }

    private function leaveRequestPayload(LeaveRequest $leaveRequest): array
    {
        $employee = $leaveRequest->employee;

        return [
            'id' => $leaveRequest->id,
            'employee_id' => $leaveRequest->employee_id,
            'leave_type_id' => $leaveRequest->leave_type_id,
            'type' => $leaveRequest->leaveType?->name,
            'leaveType' => $leaveRequest->leaveType?->name,
            'startDate' => $leaveRequest->start_date?->toDateString(),
            'endDate' => $leaveRequest->end_date?->toDateString(),
            'days' => $this->requestedDays($leaveRequest->start_date, $leaveRequest->end_date, $leaveRequest->is_half_day),
            'reason' => $leaveRequest->reason,
            'status' => $leaveRequest->status,
            'appliedDate' => $leaveRequest->applied_at?->toDateString(),
            'approvedDate' => $leaveRequest->approved_at?->toDateString(),
            'rejectionReason' => $leaveRequest->rejection_reason,
            'employee' => $employee ? [
                'id' => $employee->id,
                'employeeId' => 'EMP-'.str_pad((string) $employee->id, 3, '0', STR_PAD_LEFT),
                'name' => trim("{$employee->first_name} {$employee->last_name}"),
                'position' => $employee->position,
                'department' => $employee->department?->name,
                'avatar' => strtoupper(substr($employee->first_name, 0, 1).substr($employee->last_name, 0, 1)),
            ] : null,
        ];
    }

    private function balancePayload(LeaveBalance $balance): array
    {
        $total = $balance->allocated_days + $balance->carried_forward_days;

        return [
            'id' => $balance->id,
            'employee_id' => $balance->employee_id,
            'leave_type_id' => $balance->leave_type_id,
            'year' => $balance->year,
            'type' => $balance->leaveType?->name,
            'total' => $total,
            'allocated' => $balance->allocated_days,
            'used' => $balance->used_days,
            'pending' => $balance->pending_days,
            'carriedForward' => $balance->carried_forward_days,
            'remaining' => max(0, $total - $balance->used_days - $balance->pending_days),
            'employee' => $balance->employee ? trim("{$balance->employee->first_name} {$balance->employee->last_name}") : null,
        ];
    }
}
