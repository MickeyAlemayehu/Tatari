<?php

namespace App\Listeners;

use App\Events\LeaveRequestSubmitted;
use App\Models\Employee;
use App\Services\NotificationService;
use Illuminate\Support\Collection;

class SendLeaveSubmittedNotifications
{
    public function __construct(private NotificationService $notifications) {}

    public function handle(LeaveRequestSubmitted $event): void
    {
        $leave = $event->leaveRequest->loadMissing(['employee', 'leaveType']);
        $employee = $leave->employee;
        if (! $employee) {
            return;
        }

        $name = trim("{$employee->first_name} {$employee->last_name}");
        $type = $leave->leaveType?->name ?? 'leave';
        $title = 'New leave request';
        $message = "{$name} requested {$type} from "
            . $leave->start_date?->toDateString()
            . ' to '
            . $leave->end_date?->toDateString() . '.';

        $approvers = $this->resolveApprovers($employee);

        $this->notifications->notifyMany($approvers, 'leave', $title, $message, $leave);
    }

    private function resolveApprovers(Employee $employee): Collection
    {
        return Employee::query()
            ->where('status', 'active')
            ->where('id', '!=', $employee->id)
            ->get()
            ->filter(fn (Employee $e) => $e->hasPermission('approve_leave'))
            ->values();
    }
}
