<?php

namespace App\Listeners;

use App\Events\LeaveRequestCancelled;
use App\Models\Employee;
use App\Services\NotificationService;

class SendLeaveCancelledNotification
{
    public function __construct(private NotificationService $notifications) {}

    public function handle(LeaveRequestCancelled $event): void
    {
        $leave = $event->leaveRequest->loadMissing(['employee', 'leaveType']);
        $employee = $leave->employee;
        if (! $employee) {
            return;
        }

        $name = trim("{$employee->first_name} {$employee->last_name}");
        $type = $leave->leaveType?->name ?? 'leave';

        $approvers = Employee::query()
            ->where('status', 'active')
            ->where('id', '!=', $employee->id)
            ->get()
            ->filter(fn (Employee $e) => $e->hasPermission('approve_leave'));

        $this->notifications->notifyMany(
            $approvers,
            'leave',
            'Leave request cancelled',
            "{$name} cancelled a pending {$type} request.",
            $leave
        );
    }
}
