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
use Illuminate\Support\Facades\DB;

class PerformanceEvaluationWorkflowSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::first();

        $staff = Employee::where('email', 'staff@tatari.local')->first();
        $manager = Employee::where('email', 'manager@tatari.local')->first();
        $admin = Employee::where('email', 'admin@tatari.local')->first();

        if (!$company || !$staff || !$manager) {

            $this->command->warn(
                'PerformanceEvaluationWorkflowSeeder: required employees not found – skipping.'
            );

            return;
        }

        // =====================================================
        // GET TEMPLATES (one per evaluation_type)
        // =====================================================

        $selfTemplate = EvaluationTemplate::where('evaluation_type', 'self')
            ->where('status', 'active')
            ->first();

        $peerTemplate = EvaluationTemplate::where('evaluation_type', 'peer')
            ->where('status', 'active')
            ->first();

        $managerTemplate = EvaluationTemplate::where('evaluation_type', 'manager')
            ->where('status', 'active')
            ->first();

        if (!$selfTemplate || !$peerTemplate || !$managerTemplate) {

            $this->command->warn(
                'PerformanceEvaluationWorkflowSeeder: one or more evaluation templates not found – skipping.'
            );

            return;
        }

        // =====================================================
        // CREATE EVALUATION PERIOD
        // =====================================================

        $period = EvaluationPeriod::updateOrCreate(
            [
                'name' => '2026 H1 Evaluation'
            ],
            [
                'company_id' => $company->id,
                'start_date' => '2026-01-01',
                'end_date' => '2026-06-30',
                'status' => 'active',
            ]
        );

        // =====================================================
        // LINK TEMPLATES TO PERIOD (pivot table)
        // =====================================================

        $templateMap = [
            'self' => $selfTemplate,
            'peer' => $peerTemplate,
            'manager' => $managerTemplate,
        ];

        foreach ($templateMap as $type => $template) {
            DB::table('evaluation_period_templates')->updateOrInsert(
                [
                    'evaluation_period_id' => $period->id,
                    'template_id' => $template->id,
                ],
                [
                    'evaluation_type' => $type,
                    'department_id' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // =====================================================
        // SEED EVALUATIONS FOR ALL THREE EMPLOYEES
        // =====================================================

        // Staff: evaluated by self, by manager (peer), by admin (manager)
        $this->seedEmployeeEvaluations(
            period: $period,
            employee: $staff,
            selfEvaluator: $staff,
            peerEvaluator: $manager,
            managerEvaluator: $admin ?? $manager,
            assignedBy: $manager,
            selfTemplate: $selfTemplate,
            peerTemplate: $peerTemplate,
            managerTemplate: $managerTemplate,
            selfRatings: [4],
            peerRatings: [5],
            managerRatings: [4],
            selfComments: 'I delivered consistent results this period and exceeded my goals.',
            peerComments: 'Highly collaborative teammate and reliable contributor.',
            managerComments: 'Strong technical delivery and growing leadership presence.',
        );

        // Manager: evaluated by self, by staff (peer), by admin (manager)
        $this->seedEmployeeEvaluations(
            period: $period,
            employee: $manager,
            selfEvaluator: $manager,
            peerEvaluator: $staff,
            managerEvaluator: $admin ?? $manager,
            assignedBy: $admin ?? $manager,
            selfTemplate: $selfTemplate,
            peerTemplate: $peerTemplate,
            managerTemplate: $managerTemplate,
            selfRatings: [5],
            peerRatings: [4],
            managerRatings: [5],
            selfComments: 'Successfully led the HR team and met all department objectives.',
            peerComments: 'Great leader, always supportive and available for guidance.',
            managerComments: 'Excellent management skills with strong team development focus.',
        );

        // Admin: evaluated by self, by manager (peer), by manager (manager review)
        if ($admin) {
            $this->seedEmployeeEvaluations(
                period: $period,
                employee: $admin,
                selfEvaluator: $admin,
                peerEvaluator: $manager,
                managerEvaluator: $manager,
                assignedBy: $admin,
                selfTemplate: $selfTemplate,
                peerTemplate: $peerTemplate,
                managerTemplate: $managerTemplate,
                selfRatings: [5],
                peerRatings: [5],
                managerRatings: [4],
                selfComments: 'Implemented key organizational improvements and maintained system stability.',
                peerComments: 'Outstanding leadership and vision for the organization.',
                managerComments: 'Strong strategic leadership with room for delegation improvement.',
            );
        }

        $this->command->info('PerformanceEvaluationWorkflowSeeder: seeded successfully.');
    }

    // =====================================================
    // SEED FULL EVALUATION CYCLE FOR ONE EMPLOYEE
    // =====================================================

    private function seedEmployeeEvaluations(
        EvaluationPeriod $period,
        Employee $employee,
        Employee $selfEvaluator,
        Employee $peerEvaluator,
        Employee $managerEvaluator,
        ?Employee $assignedBy,
        EvaluationTemplate $selfTemplate,
        EvaluationTemplate $peerTemplate,
        EvaluationTemplate $managerTemplate,
        array $selfRatings,
        array $peerRatings,
        array $managerRatings,
        string $selfComments,
        string $peerComments,
        string $managerComments,
    ): void {

        // Create assignments
        $selfAssignment = $this->makeAssignment(
            $period,
            $employee,
            $selfEvaluator,
            'self',
            $selfTemplate,
            $assignedBy
        );

        $peerAssignment = $this->makeAssignment(
            $period,
            $employee,
            $peerEvaluator,
            'peer',
            $peerTemplate,
            $assignedBy
        );

        $managerAssignment = $this->makeAssignment(
            $period,
            $employee,
            $managerEvaluator,
            'manager',
            $managerTemplate,
            $assignedBy
        );

        // Submit evaluations with answers
        $selfScore = $this->submitWithAnswers(
            assignment: $selfAssignment,
            template: $selfTemplate,
            ratings: $selfRatings,
            comments: $selfComments,
        );

        $peerScore = $this->submitWithAnswers(
            assignment: $peerAssignment,
            template: $peerTemplate,
            ratings: $peerRatings,
            comments: $peerComments,
        );

        $managerScore = $this->submitWithAnswers(
            assignment: $managerAssignment,
            template: $managerTemplate,
            ratings: $managerRatings,
            comments: $managerComments,
        );

        // Calculate final score
        $finalScore = round(($selfScore + $peerScore + $managerScore) / 3, 2);

        // Create performance summary
        PerformanceSummary::updateOrCreate(
            [
                'employee_id' => $employee->id,
                'evaluation_period_id' => $period->id,
            ],
            [
                'self_score' => $selfScore,
                'peer_score' => $peerScore,
                'manager_score' => $managerScore,
                'final_score' => $finalScore,
                'calculated_at' => now(),
            ]
        );

        $this->command->info(
            "  → {$employee->first_name} {$employee->last_name}: final score = {$finalScore}"
        );
    }

    // =====================================================
    // CREATE ASSIGNMENT
    // =====================================================

    private function makeAssignment(
        EvaluationPeriod $period,
        Employee $employee,
        Employee $evaluator,
        string $type,
        EvaluationTemplate $template,
        ?Employee $assignedBy,
    ): EvaluationAssignment {

        return EvaluationAssignment::updateOrCreate(
            [
                'evaluation_period_id' => $period->id,
                'employee_id' => $employee->id,
                'evaluator_id' => $evaluator->id,
                'evaluator_type' => $type,
            ],
            [
                'template_id' => $template->id,
                'evaluator_role' => $type,
                'assigned_by' => $assignedBy?->id,
                'assigned_at' => now(),
            ]
        );
    }

    // =====================================================
    // SUBMIT EVALUATION WITH ANSWERS
    // =====================================================

    private function submitWithAnswers(
        EvaluationAssignment $assignment,
        EvaluationTemplate $template,
        array $ratings,
        string $comments,
    ): float {

        // Get questions from THIS template only
        $questions = EvaluationQuestion::where(
            'template_id',
            $template->id
        )->orderBy(
                'sort_order'
            )->get();

        $ratingIndex = 0;
        $ratingSum = 0;
        $ratingCount = 0;

        $evaluation = PerformanceEvaluation::updateOrCreate(
            [
                'assignment_id' => $assignment->id
            ],
            [
                'evaluator_id' => $assignment->evaluator_id,
                'employee_id' => $assignment->employee_id,
                'evaluation_period_id' => $assignment->evaluation_period_id,
                'score' => 0,
                'comments' => $comments,
                'submitted_at' => now(),
                'status' => 'submitted',
            ]
        );

        foreach ($questions as $question) {

            if ($question->type === 'rating') {

                $rating = $ratings[$ratingIndex] ?? 3;

                $ratingIndex++;

                $ratingSum += $rating;

                $ratingCount++;

                EvaluationAnswer::updateOrCreate(
                    [
                        'evaluation_id' => $evaluation->id,
                        'question_id' => $question->id,
                    ],
                    [
                        'rating' => $rating,
                        'text_answer' => null,
                        'selected_options' => null,
                    ]
                );

            } else {

                EvaluationAnswer::updateOrCreate(
                    [
                        'evaluation_id' => $evaluation->id,
                        'question_id' => $question->id,
                    ],
                    [
                        'rating' => null,
                        'text_answer' => $comments,
                        'selected_options' => null,
                    ]
                );
            }
        }

        $score = $ratingCount > 0
            ? round($ratingSum / $ratingCount, 2)
            : 3.0;

        $evaluation->update([
            'score' => $score
        ]);

        return $score;
    }
}
