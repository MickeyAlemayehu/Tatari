<?php

namespace App\Http\Controllers;

use App\Models\Payroll;
use App\Models\Compensation;
use App\Models\Employee;
use Illuminate\Http\Request;

class PayrollController extends Controller
{
    // SC-PAY-01: Prepare Payroll
    public function generate(Request $request)
    {
        $request->validate([
            'month' => 'required',
            'year' => 'required',
            'company_id' => 'required'
        ]);

        $employees = Employee::where('company_id', $request->company_id)->get();
        $results = [];

        foreach ($employees as $emp) {
            $comp = Compensation::where('employee_id', $emp->id)->where('status', 'Active')->first();
            
            if ($comp) {
                $allowances = $comp->housing_allowance + $comp->transport_allowance + $comp->other_allowances;
                $unpaidDays = $request->unpaid_days ?? 0;
                $lwpAmount = ($comp->basic_salary / 30) * $unpaidDays;
                
                $gross = $comp->basic_salary + $allowances;
                $net = $gross - $lwpAmount;

                $payroll = Payroll::create([
                    'employee_id' => $emp->id,
                    'company_id' => $request->company_id,
                    'year' => $request->year,
                    'month' => $request->month,
                    'basic_salary' => $comp->basic_salary,
                    'total_allowances' => $allowances,
                    'unpaid_leave_days' => $unpaidDays,
                    'unpaid_leave_amount' => $lwpAmount,
                    'gross_salary' => $gross,
                    'net_salary' => $net,
                    'status' => 'Draft',
                    'generated_at' => now(),
                ]);
                $results[] = $payroll;
            }
        }

        return response()->json(['message' => 'Payroll generated as Draft', 'data' => $results]);
    }

    // SC-PAY-02: Approve Payroll
    public function approve($id)
    {
        $payroll = Payroll::findOrFail($id);
        $payroll->update([
            'status' => 'Approved',
            'approved_by' => auth()->id(),
            'approved_at' => now()
        ]);
        return response()->json(['message' => 'Payroll Approved']);
    }

    // SC-PAY-02: Reject Payroll
    public function reject(Request $request, $id)
    {
        $request->validate(['remarks' => 'required']);
        $payroll = Payroll::findOrFail($id);
        $payroll->update([
            'status' => 'Rejected',
            'rejection_remarks' => $request->remarks
        ]);
        return response()->json(['message' => 'Payroll Rejected']);
    }
}