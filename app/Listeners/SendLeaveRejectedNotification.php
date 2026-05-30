<?php

namespace App\Listeners;

use App\Events\LeaveRequestRejected;
use App\Services\NotificationService;

class SendLeaveRejectedNotification
{
    public function __construct(private NotificationService $notifications) {}

    public function handle(LeaveRequestRejected $event): void
    {
        $leave = $event->leaveRequest->loadMissing(['employee', 'leaveType']);
        $employee = $leave->employee;
        if (! $employee) {
            return;
        }

        $approverName = trim("{$event->approver->first_name} {$event->approver->last_name}");
        $type = $leave->leaveType?->name ?? 'leave';
        $tail = $event->reason ? " Reason: {$event->reason}" : '';

        $this->notifications->notify(
            $employee,
            'leave',
            'Leave request rejected',
            "Your {$type} request was rejected by {$approverName}.{$tail}",
            $leave
        );
    }
}
