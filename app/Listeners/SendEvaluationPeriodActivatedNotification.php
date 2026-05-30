<?php

namespace App\Listeners;

use App\Events\EvaluationPeriodActivated;
use App\Models\Employee;
use App\Services\NotificationService;

class SendEvaluationPeriodActivatedNotification
{
    public function __construct(private NotificationService $notifications) {}

    public function handle(EvaluationPeriodActivated $event): void
    {
        $period = $event->period;
        $title = "Evaluation period active: {$period->name}";
        $message = "The evaluation period \"{$period->name}\" is now open. "
            . 'Check your assignments to begin.';

        $recipients = Employee::query()
            ->where('status', 'active')
            ->get();

        $this->notifications->notifyMany($recipients, 'performance', $title, $message, $period);
    }
}
