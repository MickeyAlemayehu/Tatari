<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payroll extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'employee_id', 'company_id', 'year', 'month',
        'basic_salary', 'total_allowances', 'bonuses',
        'deductions', 'unpaid_leave_days', 'unpaid_leave_amount',
        'gross_salary', 'net_salary', 'status', 'generated_at',
        'approved_by', 'approved_at', 'rejection_remarks'
    ];

    protected $casts = [
        'generated_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    public function employee() {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    public function company() {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function approver() {
        return $this->belongsTo(Employee::class, 'approved_by');
    }
}
