<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'recipient_type','recipient_id',
        'title','message','notification_type',
        'reference_type','reference_id','is_read'
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    public function recipient() {
        return $this->morphTo();
    }

    public function toPayload(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'message' => $this->message,
            'type' => $this->uiType(),
            'category' => $this->category(),
            'notification_type' => $this->notification_type,
            'timestamp' => $this->created_at?->diffForHumans(),
            'created_at' => $this->created_at,
            'read' => $this->is_read,
            'is_read' => $this->is_read,
            'reference_type' => $this->reference_type,
            'reference_id' => $this->reference_id,
        ];
    }

    private function uiType(): string
    {
        return match ($this->notification_type) {
            'payroll', 'employee', 'recruitment' => 'success',
            'performance' => 'warning',
            'system', 'alert' => 'alert',
            default => 'info',
        };
    }

    private function category(): string
    {
        return match ($this->notification_type) {
            'leave' => 'Leave',
            'payroll' => 'Payroll',
            'recruitment' => 'Recruitment',
            'performance' => 'Performance',
            'employee' => 'Employee',
            'system' => 'System',
            default => ucfirst($this->notification_type),
        };
    }
}
