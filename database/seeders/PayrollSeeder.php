<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Compensation;
use App\Models\Employee;
use App\Models\Payroll;
use Illuminate\Database\Seeder;

class PayrollSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('email', 'hr@tatari.local')->first() ?? Company::query()->first();

        if (! $company) {
            return;
        }

        Employee::query()
            ->where('status', 'active')
            ->whereHas('department', fn ($query) => $query->where('company_id', $company->id))
            ->get()
            ->each(function (Employee $employee) use ($company): void {
                $salary = match (true) {
                    $employee->permission_level >= 8 => 12000,
                    $employee->permission_level >= 6 => 9500,
                    $employee->permission_level >= 4 => 7600,
                    default => 6200,
                };

                Compensation::updateOrCreate(
                    ['employee_id' => $employee->id],
                    [
                        'basic_salary' => $salary,
                        'housing_allowance' => round($salary * 0.12, 2),
                        'transport_allowance' => round($salary * 0.05, 2),
                        'other_allowances' => round($salary * 0.03, 2),
                        'currency' => 'USD',
                        'effective_from' => now()->startOfYear()->toDateString(),
                        'effective_to' => null,
                        'status' => 'active',
                    ]
                );

                foreach ([now()->subMonth(), now()] as $date) {
                    $allowances = round($salary * 0.20, 2);
                    $gross = $salary + $allowances;
                    $deductions = round($gross * 0.12, 2);
                    $net = $gross - $deductions;

                    Payroll::updateOrCreate(
                        [
                            'employee_id' => $employee->id,
                            'company_id' => $company->id,
                            'year' => (int) $date->format('Y'),
                            'month' => (int) $date->format('n'),
                        ],
                        [
                            'basic_salary' => $salary,
                            'total_allowances' => $allowances,
                            'bonuses' => 0,
                            'deductions' => $deductions,
                            'unpaid_leave_days' => 0,
                            'unpaid_leave_amount' => 0,
                            'gross_salary' => $gross,
                            'net_salary' => $net,
                            'status' => $date->isCurrentMonth() ? 'draft' : 'approved',
                            'generated_at' => $date->copy()->startOfMonth(),
                            'approved_by' => $date->isCurrentMonth() ? null : Employee::where('email', 'admin@tatari.local')->value('id'),
                            'approved_at' => $date->isCurrentMonth() ? null : $date->copy()->endOfMonth(),
                            'rejection_remarks' => null,
                        ]
                    );
                }
            });
    }
}
