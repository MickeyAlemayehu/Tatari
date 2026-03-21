<?php

namespace App\Models;

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
        'must_change_password','status'
    ];

    protected $hidden = ['password', 'remember_token', 'api_token'];

    protected $casts = [
        'password' => 'hashed',
        'permission_override' => 'array',
        'custom_override' => 'array',
        'revoked_permissions' => 'array',
        'must_change_password' => 'boolean'
    ];

    public function hasRequiredLevel(int $requiredLevel): bool
    {
        return $this->permission_level >= $requiredLevel;
    }

    public function hasPermission(string $permission, ?int $requiredLevel = null): bool
    {
        $revokedPermissions = $this->revoked_permissions ?? [];
        if (in_array($permission, $revokedPermissions, true)) {
            return false;
        }

        $overrides = $this->permission_override
            ?? $this->custom_override
            ?? $this->getAttribute('custom_overide')
            ?? [];
        if (array_key_exists($permission, $overrides)) {
            return (bool) $overrides[$permission];
        }

        return $requiredLevel === null ? true : $this->hasRequiredLevel($requiredLevel);
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
}
