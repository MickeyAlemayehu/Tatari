<?php

namespace App\Listeners;

use App\Events\EmployeePasswordChanged;
use App\Services\NotificationService;

class SendEmployeePasswordChangedNotification
{
    public function __construct(private NotificationService $notifications) {}

    public function handle(EmployeePasswordChanged $event): void
    {
        $this->notifications->notify(
            $event->employee,
            'system',
            'Password updated',
            'Your account password was changed. If this was not you, contact your administrator immediately.',
            $event->employee
        );
    }
}
