<?php

namespace App\Listeners;

use App\Events\LeaveRequestApproved;
use App\Services\NotificationService;

class SendLeaveApprovedNotification
{
    public function __construct(private NotificationService $notifications) {}

    public function handle(LeaveRequestApproved $event): void
    {
        $leave = $event->leaveRequest->loadMissing(['employee', 'leaveType']);
        $employee = $leave->employee;
        if (! $employee) {
            return;
        }

        $approverName = trim("{$event->approver->first_name} {$event->approver->last_name}");
        $type = $leave->leaveType?->name ?? 'leave';

        $this->notifications->notify(
            $employee,
            'leave',
            'Leave request approved',
            "Your {$type} request from "
                . $leave->start_date?->toDateString()
                . ' to '
                . $leave->end_date?->toDateString()
                . " was approved by {$approverName}.",
            $leave
        );
    }
}
