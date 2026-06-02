<?php

namespace App\Services;

use App\Events\NotificationCreated;
use App\Models\Employee;
use App\Models\Notification;
use Illuminate\Database\Eloquent\Model;
use Throwable;

class NotificationService
{
    public function notify(
        Employee $recipient,
        string $type,
        string $title,
        string $message,
        ?Model $reference = null
    ): Notification {
        $notification = Notification::create([
            'recipient_type'    => $recipient::class,
            'recipient_id'      => $recipient->id,
            'title'             => $title,
            'message'           => $message,
            'notification_type' => $type,
            'reference_type'    => $reference ? $reference::class : null,
            'reference_id'      => $reference?->getKey(),
            'is_read'           => false,
        ]);

        try {
            broadcast(new NotificationCreated($notification))->toOthers();
        } catch (Throwable $e) {
            report($e);
        }

        return $notification;
    }

    /**
     * @param iterable<Employee> $recipients
     */
    public function notifyMany(
        iterable $recipients,
        string $type,
        string $title,
        string $message,
        ?Model $reference = null
    ): int {
        $count = 0;
        foreach ($recipients as $recipient) {
            if ($recipient instanceof Employee) {
                $this->notify($recipient, $type, $title, $message, $reference);
                $count++;
            }
        }
        return $count;
    }
}
