<?php

namespace App\Listeners;

use App\Events\EvaluationSubmitted;
use App\Services\NotificationService;

class SendEvaluationSubmittedNotification
{
    public function __construct(private NotificationService $notifications) {}

    public function handle(EvaluationSubmitted $event): void
    {
        $evaluation = $event->evaluation->loadMissing(['employee.manager', 'evaluator', 'assignment']);
        $employee = $evaluation->employee;
        $manager = $employee?->manager;
        if (! $manager || $manager->id === $evaluation->evaluator_id) {
            return;
        }

        $employeeName = trim("{$employee->first_name} {$employee->last_name}");
        $evaluatorName = $evaluation->evaluator
            ? trim("{$evaluation->evaluator->first_name} {$evaluation->evaluator->last_name}")
            : 'An evaluator';
        $type = $evaluation->assignment?->evaluator_type ?? 'evaluation';

        $this->notifications->notify(
            $manager,
            'performance',
            'Evaluation submitted',
            "{$evaluatorName} submitted a {$type} evaluation for {$employeeName}.",
            $evaluation
        );
    }
}
