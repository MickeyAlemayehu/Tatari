<?php

namespace App\Listeners;

use App\Events\EmployeeDeactivated;
use App\Models\Employee;
use App\Services\NotificationService;

class SendEmployeeDeactivatedNotification
{
    public function __construct(private NotificationService $notifications) {}

    public function handle(EmployeeDeactivated $event): void
    {
        $employee = $event->employee;
        $name = trim("{$employee->first_name} {$employee->last_name}");

        $recipients = Employee::query()
            ->where('status', 'active')
            ->where('id', '!=', $employee->id)
            ->get()
            ->filter(fn (Employee $e) => $e->hasPermission('manage_employees'));

        $this->notifications->notifyMany(
            $recipients,
            'employee',
            'Employee deactivated',
            "{$name} was deactivated.",
            $employee
        );
    }
}
