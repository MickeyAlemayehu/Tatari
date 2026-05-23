<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Employee;
use App\Models\EvaluationAnswer;
use App\Models\EvaluationAssignment;
use App\Models\EvaluationPeriod;
use App\Models\EvaluationQuestion;
use App\Models\EvaluationTemplate;
use App\Models\PerformanceEvaluation;
use App\Models\PerformanceSummary;
use Illuminate\Database\Seeder;

class PerformanceEvaluationWorkflowSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('email', 'hr@tatari.local')->first() ?? Company::query()->first();
        $staff   = Employee::where('email', 'staff@tatari.local')->first();
        $manager = Employee::where('email', 'manager@tatari.local')->first();
        $admin   = Employee::where('email', 'admin@tatari.local')->first();

        if (! $company || ! $staff || ! $manager) {
            $this->command->warn('PerformanceEvaluationWorkflowSeeder: required employees not found – skipping.');
            return;
        }

        // ── Resolve the active template ───────────────────────────────────
        $template = EvaluationTemplate::where('company_id', $company->id)
            ->where('status', 'active')
            ->first();

        // ── Create evaluation period linked to the template ───────────────
        $period = EvaluationPeriod::updateOrCreate(
            ['company_id' => $company->id, 'name' => '2026 H1 Evaluation'],
            [
                'start_date'  => '2026-01-01',
                'end_date'    => '2026-06-30',
                'status'      => 'active',
                'template_id' => $template?->id,
            ]
        );

        // ── Assignments ───────────────────────────────────────────────────
        $selfAssignment    = $this->makeAssignment($period, $staff, $staff, 'self', $manager);
        $peerAssignment    = $this->makeAssignment($period, $staff, $manager, 'peer', $manager);
        $managerAssignment = $this->makeAssignment($period, $staff, $admin ?? $manager, 'manager', $manager);

        // ── Submit evaluations with real answer records ───────────────────
        if ($template) {
            // Self evaluation – staff rates themselves
            $selfScore = $this->submitWithAnswers(
                assignment : $selfAssignment,
                evalType   : 'self',
                template   : $template,
                ratings    : [4, 4, 4, 3],  // one answer per rating question
                comments   : 'I delivered consistent results this period and exceeded my Q1 goals. Would like to improve cross-team communication skills.',
            );

            // Peer evaluation – manager rates staff
            $peerScore = $this->submitWithAnswers(
                assignment : $peerAssignment,
                evalType   : 'peer',
                template   : $template,
                ratings    : [5, 4, 4, 4],
                comments   : 'Highly collaborative teammate. Delivers on time and communicates clearly.',
            );

            // Manager evaluation – admin rates staff
            $managerScore = $this->submitWithAnswers(
                assignment : $managerAssignment,
                evalType   : 'manager',
                template   : $template,
                ratings    : [4, 5, 3, 4],
                comments   : 'Strong technical delivery and growing leadership presence. Needs to set more ambitious stretch goals.',
            );

            // ── Weighted final score ──────────────────────────────────────
            $weights = $template->weights ?? ['self' => 20, 'peer' => 30, 'manager' => 50];
            $total   = ($weights['self'] + $weights['peer'] + $weights['manager']) ?: 100;

            $finalScore = round(
                ($selfScore    * $weights['self']    +
                 $peerScore    * $weights['peer']    +
                 $managerScore * $weights['manager']) / $total,
                2
            );

        } else {
            // No template – fall back to plain averages
            $selfScore    = 4.0;
            $peerScore    = 4.3;
            $managerScore = 4.0;
            $finalScore   = round(($selfScore + $peerScore + $managerScore) / 3, 2);

            $this->submitRaw($selfAssignment,    $selfScore,    'Consistent delivery and solid collaboration.');
            $this->submitRaw($peerAssignment,    $peerScore,    'Reliable teammate with clear communication.');
            $this->submitRaw($managerAssignment, $managerScore, 'Strong technical delivery, growing leadership.');
        }

        // ── Performance summary ───────────────────────────────────────────
        PerformanceSummary::updateOrCreate(
            ['employee_id' => $staff->id, 'evaluation_period_id' => $period->id],
            [
                'self_score'    => $selfScore,
                'peer_score'    => $peerScore,
                'manager_score' => $managerScore,
                'final_score'   => $finalScore,
                'calculated_at' => now(),
            ]
        );

        $this->command->info("PerformanceEvaluationWorkflowSeeder: seeded period '{$period->name}', final score = {$finalScore}.");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private function makeAssignment(
        EvaluationPeriod $period,
        Employee $employee,
        Employee $evaluator,
        string $type,
        ?Employee $assignedBy,
    ): EvaluationAssignment {
        return EvaluationAssignment::updateOrCreate(
            [
                'evaluation_period_id' => $period->id,
                'employee_id'          => $employee->id,
                'evaluator_id'         => $evaluator->id,
                'evaluator_type'       => $type,
            ],
            [
                'assigned_by' => $assignedBy?->id,
                'assigned_at' => now(),
            ]
        );
    }

    /**
     * Submit an evaluation with individual answer rows derived from the template
     * questions for the given evaluation type. Rating questions get answers from
     * the $ratings array (in sort_order); text questions get a shared $comments string.
     * Returns the computed score (average of all provided ratings).
     */
    private function submitWithAnswers(
        EvaluationAssignment $assignment,
        string $evalType,
        EvaluationTemplate $template,
        array $ratings,
        string $comments,
    ): float {
        $questions = EvaluationQuestion::where('template_id', $template->id)
            ->where('evaluation_type', $evalType)
            ->orderBy('sort_order')
            ->get();

        $ratingIndex = 0;
        $ratingSum   = 0;
        $ratingCount = 0;

        $evaluation = PerformanceEvaluation::updateOrCreate(
            ['assignment_id' => $assignment->id],
            [
                'evaluator_id'        => $assignment->evaluator_id,
                'employee_id'         => $assignment->employee_id,
                'evaluation_period_id'=> $assignment->evaluation_period_id,
                'score'               => 0,   // will be updated below
                'comments'            => $comments,
                'submitted_at'        => now(),
                'status'              => 'submitted',
            ]
        );

        foreach ($questions as $question) {
            if ($question->type === 'rating') {
                $rating = $ratings[$ratingIndex] ?? 3;
                $ratingIndex++;
                $ratingSum += $rating;
                $ratingCount++;

                EvaluationAnswer::updateOrCreate(
                    ['evaluation_id' => $evaluation->id, 'question_id' => $question->id],
                    ['rating' => $rating, 'text_answer' => null, 'selected_options' => null]
                );
            } else {
                // text / open-ended
                EvaluationAnswer::updateOrCreate(
                    ['evaluation_id' => $evaluation->id, 'question_id' => $question->id],
                    ['rating' => null, 'text_answer' => $comments, 'selected_options' => null]
                );
            }
        }

        $score = $ratingCount > 0 ? round($ratingSum / $ratingCount, 2) : 3.0;

        $evaluation->update(['score' => $score]);

        return $score;
    }

    /**
     * Fallback: submit a simple evaluation without individual answers (no template).
     */
    private function submitRaw(EvaluationAssignment $assignment, float $score, string $comments): void
    {
        PerformanceEvaluation::updateOrCreate(
            ['assignment_id' => $assignment->id],
            [
                'evaluator_id'         => $assignment->evaluator_id,
                'employee_id'          => $assignment->employee_id,
                'evaluation_period_id' => $assignment->evaluation_period_id,
                'score'                => $score,
                'comments'             => $comments,
                'submitted_at'         => now(),
                'status'               => 'submitted',
            ]
        );
    }
}
