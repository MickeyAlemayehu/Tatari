<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeaveType extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id','name','description','max_days_per_year',
        'is_paid','allow_half_day','carry_forward_allowed',
        'max_carry_forward_days','status'
    ];

    public function company() {
        return $this->belongsTo(Company::class);
    }

    public function leaveRequests() {
        return $this->hasMany(LeaveRequest::class);
    }
}
