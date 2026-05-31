<?php

namespace App\Models;

use App\Support\EmployeePermissions;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Employee extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'email','password','first_name','last_name','position',
        'department_id','manager_id','permission_level',
        'permission_override','custom_override','revoked_permissions',
        'must_change_password','status',
        'phone','date_of_birth','address','city','state','zip_code'
    ];

    protected $hidden = ['password', 'remember_token', 'api_token'];

    protected $casts = [
        'password' => 'hashed',
        'permission_override' => 'array',
        'custom_override' => 'array',
        'revoked_permissions' => 'array',
        'must_change_password' => 'boolean',
        'date_of_birth' => 'date',
    ];

    protected static function booted(): void
    {
        static::creating(function (Employee $employee) {
            if ($employee->permission_level === null) {
                $employee->permission_level = config('permission_levels.default_level', 1);
            }
            $employee->permission_level = EmployeePermissions::normalizeLevel((int) $employee->permission_level);
        });

        static::updating(function (Employee $employee) {
            if ($employee->isDirty('permission_level')) {
                $employee->permission_level = EmployeePermissions::normalizeLevel((int) $employee->permission_level);
            }
        });

        static::updated(function (Employee $employee) {
            if ($employee->wasChanged('status') && $employee->status === 'inactive') {
                event(new \App\Events\EmployeeDeactivated($employee));
            }
        });
    }

    public function hasPermission(string $permission): bool
    {
        return in_array($permission, EmployeePermissions::effectivePermissions($this), true);
    }

    /** @deprecated Use hasPermission() — level thresholds are no longer used. */
    public function hasRequiredLevel(int $requiredLevel): bool
    {
        return EmployeePermissions::normalizeLevel((int) $this->permission_level) >= EmployeePermissions::normalizeLevel($requiredLevel);
    }

    public function department() {
        return $this->belongsTo(Department::class);
    }

    public function manager() {
        return $this->belongsTo(Employee::class, 'manager_id');
    }

    public function subordinates() {
        return $this->hasMany(Employee::class, 'manager_id');
    }

    public function leaveRequests() {
        return $this->hasMany(LeaveRequest::class);
    }

    public function leaveBalances() {
        return $this->hasMany(LeaveBalance::class);
    }

    public function payrolls() {
        return $this->hasMany(Payroll::class);
    }

    public function compensations() {
        return $this->hasMany(Compensation::class);
    }

    public function performanceReviews()
    {
        return $this->hasMany(PerformanceReview::class, 'employee_id');
    }

    public function performanceReviewsGiven()
    {
        return $this->hasMany(PerformanceReview::class, 'reviewer_id');
    }
}
