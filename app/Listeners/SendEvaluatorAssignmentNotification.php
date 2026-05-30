<?php

namespace App\Listeners;

use App\Events\EvaluatorsAssigned;
use App\Services\NotificationService;

class SendEvaluatorAssignmentNotification
{
    public function __construct(private NotificationService $notifications) {}

    public function handle(EvaluatorsAssigned $event): void
    {
        foreach ($event->assignments as $assignment) {
            $assignment->loadMissing(['employee', 'evaluator', 'period']);
            $evaluator = $assignment->evaluator;
            $subject = $assignment->employee;
            if (! $evaluator || ! $subject) {
                continue;
            }

            $subjectName = trim("{$subject->first_name} {$subject->last_name}");
            $period = $assignment->period?->name ?? 'the current period';
            $type = $assignment->evaluator_type; // self, peer, manager

            $title = match ($type) {
                'self'    => 'Self-evaluation assigned',
                'peer'    => 'Peer evaluation assigned',
                'manager' => 'Manager evaluation assigned',
                default   => 'Evaluation assigned',
            };

            $message = $type === 'self'
                ? "You have a self-evaluation to complete for {$period}."
                : "You were assigned to evaluate {$subjectName} for {$period}.";

            $this->notifications->notify(
                $evaluator,
                'performance',
                $title,
                $message,
                $assignment
            );
        }
    }
}
