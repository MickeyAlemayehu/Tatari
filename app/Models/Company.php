<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_name','email','phone','address','logo','expiration_date',
        'industry','size','country','city','website','contact_name','contact_email',
        'contact_phone','contact_title','employee_count','description',
        'registration_number','status'
    ];

    protected $casts = [
        'expiration_date' => 'date',
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
