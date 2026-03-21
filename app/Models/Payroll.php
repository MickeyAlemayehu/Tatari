<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payroll extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'employee_id','company_id','year','month',
        'basic_salary','total_allowances','bonuses',
        'deductions','unpaid_leave_days','unpaid_leave_amount',
        'status','generated_at','approved_by','approved_at'
    ];

    public function employee() {
        return $this->belongsTo(Employee::class);
    }

    public function company() {
        return $this->belongsTo(Company::class);
    }

    public function approver() {
        return $this->belongsTo(Employee::class, 'approved_by');
    }
}
