<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Employee;
use App\Models\EvaluationAssignment;
use App\Models\EvaluationPeriod;
use App\Models\PerformanceEvaluation;
use App\Models\PerformanceSummary;
use Illuminate\Database\Seeder;

class PerformanceEvaluationWorkflowSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('email', 'hr@tatari.local')->first() ?? Company::query()->first();
        $staff = Employee::where('email', 'staff@tatari.local')->first();
        $manager = Employee::where('email', 'manager@tatari.local')->first();
        $admin = Employee::where('email', 'admin@tatari.local')->first();

        if (! $company || ! $staff || ! $manager) {
            return;
        }

        $period = EvaluationPeriod::updateOrCreate(
            ['company_id' => $company->id, 'name' => '2026 H1 Evaluation'],
            [
                'start_date' => '2026-04-01',
                'end_date' => '2026-06-30',
                'status' => 'active',
            ]
        );

        $self = $this->assignment($period, $staff, $staff, 'self', $manager);
        $peer = $this->assignment($period, $staff, $manager, 'peer', $manager);
        $managerAssignment = $this->assignment($period, $staff, $admin ?? $manager, 'manager', $manager);

        $this->evaluation($self, 4.2, 'Strong collaboration and consistent delivery.');
        $this->evaluation($peer, 4.4, 'Reliable teammate with clear communication.');

        PerformanceSummary::updateOrCreate(
            ['employee_id' => $staff->id, 'evaluation_period_id' => $period->id],
            [
                'self_score' => 4.2,
                'peer_score' => 4.4,
                'manager_score' => null,
                'final_score' => 4.3,
                'calculated_at' => now(),
            ]
        );
    }

    private function assignment(EvaluationPeriod $period, Employee $employee, Employee $evaluator, string $type, ?Employee $assignedBy): EvaluationAssignment
    {
        return EvaluationAssignment::updateOrCreate(
            [
                'evaluation_period_id' => $period->id,
                'employee_id' => $employee->id,
                'evaluator_id' => $evaluator->id,
                'evaluator_type' => $type,
            ],
            [
                'assigned_by' => $assignedBy?->id,
                'assigned_at' => now(),
            ]
        );
    }

    private function evaluation(EvaluationAssignment $assignment, float $score, string $comments): void
    {
        PerformanceEvaluation::updateOrCreate(
            ['assignment_id' => $assignment->id],
            [
                'evaluator_id' => $assignment->evaluator_id,
                'employee_id' => $assignment->employee_id,
                'evaluation_period_id' => $assignment->evaluation_period_id,
                'score' => $score,
                'comments' => $comments,
                'submitted_at' => now(),
                'status' => 'submitted',
            ]
        );
    }
}
