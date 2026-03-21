<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeaveBalance extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id','leave_type_id','year',
        'allocated_days','used_days','pending_days','carried_forward_days'
    ];

    public function employee() {
        return $this->belongsTo(Employee::class);
    }

    public function leaveType() {
        return $this->belongsTo(LeaveType::class);
    }
}
