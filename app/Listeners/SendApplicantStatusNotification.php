<?php

namespace App\Listeners;

use App\Events\ApplicantStatusChanged;
use App\Models\Employee;
use App\Services\NotificationService;

class SendApplicantStatusNotification
{
    public function __construct(private NotificationService $notifications) {}

    public function handle(ApplicantStatusChanged $event): void
    {
        $applicant = $event->applicant->loadMissing('vacancy');
        $name = trim("{$applicant->first_name} {$applicant->last_name}");
        $role = $applicant->vacancy?->title ?? 'an open role';

        $verb = match ($event->newStatus) {
            'shortlisted'         => 'shortlisted',
            'rejected'            => 'rejected',
            'hired'               => 'marked as hired',
            'interview_scheduled' => 'scheduled for an interview',
            'reviewing'           => 'moved to reviewing',
            default               => "updated to {$event->newStatus}",
        };

        $recipients = collect();

        if ($event->reviewerId) {
            $reviewer = Employee::find($event->reviewerId);
            if ($reviewer) {
                $recipients->push($reviewer);
            }
        }

        Employee::query()
            ->where('status', 'active')
            ->get()
            ->filter(fn (Employee $e) => $e->hasPermission('manage_employees'))
            ->each(fn (Employee $e) => $recipients->push($e));

        $unique = $recipients->unique('id')->values();

        $this->notifications->notifyMany(
            $unique,
            'recruitment',
            'Applicant updated',
            "{$name} ({$role}) was {$verb}.",
            $applicant
        );
    }
}
