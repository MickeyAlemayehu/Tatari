<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Department;
use App\Models\Employee;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeaveManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_can_submit_leave_request_and_pending_balance_updates(): void
    {
        [$employee, $leaveType] = $this->employeeWithLeaveType();

        LeaveBalance::create([
            'employee_id' => $employee->id,
            'leave_type_id' => $leaveType->id,
            'year' => 2026,
            'allocated_days' => 20,
            'used_days' => 2,
            'pending_days' => 0,
            'carried_forward_days' => 0,
        ]);

        $response = $this->actingAs($employee, 'api')->postJson('/api/leave-requests', [
            'leave_type_id' => $leaveType->id,
            'start_date' => '2026-05-15',
            'end_date' => '2026-05-19',
            'reason' => 'Family vacation',
        ]);

        $response->assertCreated()
            ->assertJsonPath('type', 'Annual Leave')
            ->assertJsonPath('days', 5)
            ->assertJsonPath('status', 'pending');

        $this->assertDatabaseHas('leave_balances', [
            'employee_id' => $employee->id,
            'leave_type_id' => $leaveType->id,
            'pending_days' => 5,
        ]);
    }

    public function test_employee_can_view_own_leave_requests_and_balances(): void
    {
        [$employee, $leaveType] = $this->employeeWithLeaveType();

        LeaveBalance::create([
            'employee_id' => $employee->id,
            'leave_type_id' => $leaveType->id,
            'year' => now()->year,
            'allocated_days' => 20,
            'used_days' => 3,
            'pending_days' => 2,
            'carried_forward_days' => 1,
        ]);

        LeaveRequest::create([
            'employee_id' => $employee->id,
            'leave_type_id' => $leaveType->id,
            'start_date' => '2026-05-15',
            'end_date' => '2026-05-16',
            'reason' => 'Family event',
            'status' => 'pending',
            'applied_at' => now(),
        ]);

        $this->actingAs($employee, 'api')->getJson('/api/leave-requests/my')
            ->assertOk()
            ->assertJsonPath('data.0.type', 'Annual Leave');

        $this->actingAs($employee, 'api')->getJson('/api/leave-balances/my')
            ->assertOk()
            ->assertJsonPath('data.0.total', 21)
            ->assertJsonPath('data.0.remaining', 16);
    }

    public function test_approver_can_approve_pending_leave_request(): void
    {
        [$employee, $leaveType] = $this->employeeWithLeaveType();
        $approver = Employee::factory()->manager()->create([
            'permission_override' => ['approve_leave' => true],
        ]);

        LeaveBalance::create([
            'employee_id' => $employee->id,
            'leave_type_id' => $leaveType->id,
            'year' => 2026,
            'allocated_days' => 20,
            'used_days' => 1,
            'pending_days' => 2,
            'carried_forward_days' => 0,
        ]);

        $request = LeaveRequest::create([
            'employee_id' => $employee->id,
            'leave_type_id' => $leaveType->id,
            'start_date' => '2026-05-15',
            'end_date' => '2026-05-16',
            'reason' => 'Family event',
            'status' => 'pending',
            'applied_at' => now(),
        ]);

        $response = $this->actingAs($approver, 'api')
            ->postJson("/api/leave-requests/{$request->id}/approve");

        $response->assertOk()
            ->assertJsonPath('status', 'approved');

        $this->assertDatabaseHas('leave_balances', [
            'employee_id' => $employee->id,
            'leave_type_id' => $leaveType->id,
            'used_days' => 3,
            'pending_days' => 0,
        ]);
    }

    public function test_approver_can_reject_pending_leave_request(): void
    {
        [$employee, $leaveType] = $this->employeeWithLeaveType();
        $approver = Employee::factory()->manager()->create([
            'permission_override' => ['approve_leave' => true],
        ]);

        LeaveBalance::create([
            'employee_id' => $employee->id,
            'leave_type_id' => $leaveType->id,
            'year' => 2026,
            'allocated_days' => 20,
            'used_days' => 1,
            'pending_days' => 2,
            'carried_forward_days' => 0,
        ]);

        $request = LeaveRequest::create([
            'employee_id' => $employee->id,
            'leave_type_id' => $leaveType->id,
            'start_date' => '2026-05-15',
            'end_date' => '2026-05-16',
            'reason' => 'Family event',
            'status' => 'pending',
            'applied_at' => now(),
        ]);

        $response = $this->actingAs($approver, 'api')
            ->postJson("/api/leave-requests/{$request->id}/reject", [
                'rejection_reason' => 'Coverage is not available that week',
            ]);

        $response->assertOk()
            ->assertJsonPath('status', 'rejected')
            ->assertJsonPath('rejectionReason', 'Coverage is not available that week');

        $this->assertDatabaseHas('leave_balances', [
            'employee_id' => $employee->id,
            'leave_type_id' => $leaveType->id,
            'used_days' => 1,
            'pending_days' => 0,
        ]);
    }

    public function test_staff_cannot_view_company_leave_history(): void
    {
        $staff = Employee::factory()->staff()->create();

        $this->actingAs($staff, 'api')->getJson('/api/leave-requests')
            ->assertForbidden();
    }

    private function employeeWithLeaveType(): array
    {
        $company = Company::create([
            'company_name' => 'Acme',
            'email' => 'acme@example.com',
            'phone' => '123',
            'expiration_date' => now()->addYear()->toDateString(),
        ]);

        $department = Department::create([
            'company_id' => $company->id,
            'name' => 'Engineering',
            'description' => 'Builds products',
        ]);

        $employee = Employee::factory()->staff()->create(['department_id' => $department->id]);

        $leaveType = LeaveType::create([
            'company_id' => $company->id,
            'name' => 'Annual Leave',
            'description' => 'Annual leave allocation',
            'max_days_per_year' => 20,
            'is_paid' => true,
            'allow_half_day' => true,
            'carry_forward_allowed' => true,
            'max_carry_forward_days' => 5,
            'status' => 'active',
        ]);

        return [$employee, $leaveType];
    }
}
