<?php

namespace App\Listeners;

use App\Events\EmployeeCreated;
use App\Mail\EmployeeWelcome;
use App\Models\Employee;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendEmployeeCreatedNotification
{
    public function __construct(private NotificationService $notifications) {}

    public function handle(EmployeeCreated $event): void
    {
        $employee = $event->employee->loadMissing('department');
        $name = trim("{$employee->first_name} {$employee->last_name}");
        $dept = $employee->department?->name;

        // ── Send welcome email with login credentials ──
        try {
            Mail::send(new EmployeeWelcome($employee));
        } catch (\Throwable $e) {
            Log::warning("Failed to send welcome email to {$employee->email}: {$e->getMessage()}");
        }

        // ── Notify admins / HR ──
        $recipients = Employee::query()
            ->where('status', 'active')
            ->where('id', '!=', $employee->id)
            ->get()
            ->filter(fn (Employee $e) => $e->hasPermission('manage_employees'));

        $this->notifications->notifyMany(
            $recipients,
            'employee',
            'Employee added',
            "{$name} joined" . ($dept ? " ({$dept})." : '.'),
            $employee
        );
    }
}

