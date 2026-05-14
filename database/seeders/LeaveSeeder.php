<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Employee;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class LeaveSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('email', 'hr@tatari.local')->first() ?? Company::query()->first();

        if (! $company) {
            return;
        }

        $types = [
            ['name' => 'Annual Leave', 'max_days_per_year' => 20, 'is_paid' => true, 'allow_half_day' => true],
            ['name' => 'Sick Leave', 'max_days_per_year' => 10, 'is_paid' => true, 'allow_half_day' => true],
            ['name' => 'Personal Leave', 'max_days_per_year' => 5, 'is_paid' => true, 'allow_half_day' => false],
            ['name' => 'Maternity/Paternity', 'max_days_per_year' => 90, 'is_paid' => true, 'allow_half_day' => false],
        ];

        foreach ($types as $type) {
            LeaveType::updateOrCreate(
                ['company_id' => $company->id, 'name' => $type['name']],
                [
                    'description' => $type['name'].' allocation',
                    'max_days_per_year' => $type['max_days_per_year'],
                    'is_paid' => $type['is_paid'],
                    'allow_half_day' => $type['allow_half_day'],
                    'carry_forward_allowed' => $type['name'] === 'Annual Leave',
                    'max_carry_forward_days' => $type['name'] === 'Annual Leave' ? 5 : null,
                    'status' => 'active',
                ]
            );
        }

        Employee::query()->where('status', 'active')->get()->each(function (Employee $employee): void {
            LeaveType::query()->where('status', 'active')->get()->each(function (LeaveType $type) use ($employee): void {
                LeaveBalance::updateOrCreate(
                    [
                        'employee_id' => $employee->id,
                        'leave_type_id' => $type->id,
                        'year' => now()->year,
                    ],
                    [
                        'allocated_days' => $type->max_days_per_year,
                        'used_days' => 0,
                        'pending_days' => 0,
                        'carried_forward_days' => $type->name === 'Annual Leave' ? 2 : 0,
                    ]
                );
            });
        });

        $staff = Employee::where('email', 'staff@tatari.local')->first();
        $manager = Employee::where('email', 'manager@tatari.local')->first();
        $annual = LeaveType::where('name', 'Annual Leave')->first();
        $sick = LeaveType::where('name', 'Sick Leave')->first();

        if (! $staff || ! $manager || ! $annual || ! $sick) {
            return;
        }

        $this->request($staff, $annual, '2026-05-15', '2026-05-19', 'Family vacation', 'pending');
        $this->request($staff, $sick, '2026-04-10', '2026-04-12', 'Medical appointment and recovery', 'approved', $manager);
        $this->request($manager, $annual, '2026-03-20', '2026-03-21', 'Family matters', 'approved', $staff);
    }

    private function request(
        Employee $employee,
        LeaveType $type,
        string $start,
        string $end,
        string $reason,
        string $status,
        ?Employee $approver = null
    ): void {
        $request = LeaveRequest::updateOrCreate(
            [
                'employee_id' => $employee->id,
                'leave_type_id' => $type->id,
                'start_date' => $start,
                'end_date' => $end,
            ],
            [
                'reason' => $reason,
                'status' => $status,
                'applied_at' => Carbon::parse($start)->subWeeks(2),
                'approved_by' => $approver?->id,
                'approved_at' => $approver ? Carbon::parse($start)->subWeek() : null,
            ]
        );

        $days = Carbon::parse($request->start_date)->diffInDays(Carbon::parse($request->end_date)) + 1;
        $balance = LeaveBalance::firstOrCreate(
            [
                'employee_id' => $employee->id,
                'leave_type_id' => $type->id,
                'year' => Carbon::parse($start)->year,
            ],
            [
                'allocated_days' => $type->max_days_per_year,
                'used_days' => 0,
                'pending_days' => 0,
                'carried_forward_days' => 0,
            ]
        );

        if ($status === 'pending') {
            $balance->update(['pending_days' => $balance->pending_days + $days]);
        }

        if ($status === 'approved') {
            $balance->update(['used_days' => $balance->used_days + $days]);
        }
    }
}
