<?php

namespace App\Listeners;

use App\Events\InterviewScheduled;
use App\Models\Employee;
use App\Services\NotificationService;

class SendInterviewScheduledNotification
{
    public function __construct(private NotificationService $notifications) {}

    public function handle(InterviewScheduled $event): void
    {
        $applicant = $event->applicant->loadMissing('vacancy');
        $name = trim("{$applicant->first_name} {$applicant->last_name}");
        $role = $applicant->vacancy?->title ?? 'an open role';
        $when = $applicant->interview_at?->toDayDateTimeString() ?? 'soon';

        $recipients = Employee::query()
            ->where('status', 'active')
            ->get()
            ->filter(fn (Employee $e) => $e->hasPermission('manage_employees'));

        $this->notifications->notifyMany(
            $recipients,
            'recruitment',
            'Interview scheduled',
            "Interview with {$name} for {$role} is scheduled for {$when}.",
            $applicant
        );
    }
}
