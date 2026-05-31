<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $fillable = [
        'employee_id',
        'action',
        'module',
        'description',
        'status',
        'ip_address',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Record an audit log entry.
     */
    public static function record(
        string $action,
        string $module,
        string $description,
        ?Employee $employee = null,
        string $status = 'success',
        array $metadata = []
    ): void {
        static::create([
            'employee_id' => $employee?->id,
            'action' => $action,
            'module' => $module,
            'description' => $description,
            'status' => $status,
            'ip_address' => request()->ip(),
            'metadata' => empty($metadata) ? null : $metadata,
        ]);
    }
}
