<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeaveRequest extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'employee_id','leave_type_id','start_date','end_date',
        'is_half_day','reason','status','applied_at',
        'approved_by','approved_at','rejection_reason'
    ];

    public function employee() {
        return $this->belongsTo(Employee::class);
    }

    public function leaveType() {
        return $this->belongsTo(LeaveType::class);
    }

    public function approver() {
        return $this->belongsTo(Employee::class, 'approved_by');
    }
}
