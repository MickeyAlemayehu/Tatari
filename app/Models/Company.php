<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_name','email','phone','address','logo','expiration_date'
    ];

    public function departments() {
        return $this->hasMany(Department::class);
    }

    public function employees() {
        return $this->hasManyThrough(Employee::class, Department::class);
    }

    public function leaveTypes() {
        return $this->hasMany(LeaveType::class);
    }

    public function payrolls() {
        return $this->hasMany(Payroll::class);
    }
}
