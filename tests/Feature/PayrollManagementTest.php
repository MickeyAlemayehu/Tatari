<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Compensation;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Payroll;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PayrollManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_payroll_manager_can_generate_payroll_for_company_employees(): void
    {
        [$company, $department, $manager, $employee] = $this->payrollSetup();

        Compensation::create([
            'employee_id' => $employee->id,
            'basic_salary' => 8000,
            'housing_allowance' => 800,
            'transport_allowance' => 400,
            'other_allowances' => 200,
            'currency' => 'USD',
            'effective_from' => '2026-01-01',
            'status' => 'active',
        ]);

        $response = $this->actingAs($manager, 'api')->postJson('/api/payroll/generate', [
            'company_id' => $company->id,
            'year' => 2026,
            'month' => 5,
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.0.employeeName', trim("{$employee->first_name} {$employee->last_name}"))
            ->assertJsonPath('data.0.status', 'draft');

        $this->assertDatabaseHas('payrolls', [
            'employee_id' => $employee->id,
            'company_id' => $company->id,
            'year' => 2026,
            'month' => 5,
            'status' => 'draft',
        ]);
    }

    public function test_payroll_manager_can_list_periods_and_approve_payroll(): void
    {
        [$company, $department, $manager, $employee] = $this->payrollSetup();
        $payroll = $this->payrollFor($company, $employee, ['status' => 'draft']);

        $this->actingAs($manager, 'api')->getJson('/api/payroll')
            ->assertOk()
            ->assertJsonPath('data.0.employeeCount', 1)
            ->assertJsonPath('data.0.netPay', 8800);

        $this->actingAs($manager, 'api')->postJson("/api/payroll/{$payroll->id}/approve")
            ->assertOk()
            ->assertJsonPath('status', 'approved')
            ->assertJsonPath('approvedBy', trim("{$manager->first_name} {$manager->last_name}"));

        $this->assertDatabaseHas('payrolls', [
            'id' => $payroll->id,
            'status' => 'approved',
            'approved_by' => $manager->id,
        ]);
    }

    public function test_employee_can_view_own_payslip_but_not_another_employee_payslip(): void
    {
        [$company, $department, $manager, $employee] = $this->payrollSetup();
        $other = Employee::factory()->staff()->create(['department_id' => $department->id]);
        $ownPayroll = $this->payrollFor($company, $employee);
        $otherPayroll = $this->payrollFor($company, $other);

        $this->actingAs($employee, 'api')->getJson("/api/payroll/payslips/{$ownPayroll->id}")
            ->assertOk()
            ->assertJsonPath('employeeName', trim("{$employee->first_name} {$employee->last_name}"))
            ->assertJsonPath('payPeriod', 'May 2026');

        $this->actingAs($employee, 'api')->getJson("/api/payroll/payslips/{$otherPayroll->id}")
            ->assertForbidden();
    }

    public function test_staff_cannot_manage_payroll(): void
    {
        $staff = Employee::factory()->staff()->create();

        $this->actingAs($staff, 'api')->getJson('/api/payroll')
            ->assertForbidden();
    }

    private function payrollSetup(): array
    {
        $company = Company::create([
            'company_name' => 'Acme',
            'email' => 'acme@example.com',
            'phone' => '123',
            'expiration_date' => now()->addYear()->toDateString(),
        ]);

        $department = Department::create([
            'company_id' => $company->id,
            'name' => 'Finance',
            'description' => 'Finance team',
        ]);

        $manager = Employee::factory()->manager()->create([
            'department_id' => $department->id,
            'permission_override' => ['manage_payroll' => true],
        ]);

        $employee = Employee::factory()->staff()->create(['department_id' => $department->id]);

        return [$company, $department, $manager, $employee];
    }

    private function payrollFor(Company $company, Employee $employee, array $overrides = []): Payroll
    {
        return Payroll::create(array_merge([
            'employee_id' => $employee->id,
            'company_id' => $company->id,
            'year' => 2026,
            'month' => 5,
            'basic_salary' => 8000,
            'total_allowances' => 2000,
            'bonuses' => 0,
            'deductions' => 1200,
            'unpaid_leave_days' => 0,
            'unpaid_leave_amount' => 0,
            'gross_salary' => 10000,
            'net_salary' => 8800,
            'status' => 'draft',
            'generated_at' => now(),
        ], $overrides));
    }
}
