<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\EvaluationQuestion;
use App\Models\EvaluationQuestionOption;
use App\Models\EvaluationTemplate;
use Illuminate\Database\Seeder;

class EvaluationTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('email', 'hr@tatari.local')->first() ?? Company::query()->first();

        if (! $company) {
            return;
        }

        // ── Deactivate any existing active templates ──────────────────────
        EvaluationTemplate::where('company_id', $company->id)
            ->where('status', 'active')
            ->update(['status' => 'inactive']);

        // ── Create (or find) the canonical template ───────────────────────
        $template = EvaluationTemplate::updateOrCreate(
            ['company_id' => $company->id, 'title' => 'Standard 360° Review'],
            [
                'description' => 'Comprehensive 360-degree evaluation covering self-assessment, peer feedback, and manager appraisal.',
                'status'      => 'active',
                'weights'     => ['self' => 20, 'peer' => 30, 'manager' => 50],
            ]
        );

        // ── Rating scale options (shared across rating questions) ─────────
        $ratingOptions = [
            ['label' => 'Exceptional',    'value' => 5, 'sort_order' => 1],
            ['label' => 'Exceeds Expectations', 'value' => 4, 'sort_order' => 2],
            ['label' => 'Meets Expectations',   'value' => 3, 'sort_order' => 3],
            ['label' => 'Needs Improvement',    'value' => 2, 'sort_order' => 4],
            ['label' => 'Unsatisfactory',       'value' => 1, 'sort_order' => 5],
        ];

        // ── Question definitions ──────────────────────────────────────────
        $questions = [
            // ── Self Evaluation ──────────────────────────────────────────
            [
                'evaluation_type' => 'self',
                'type'            => 'rating',
                'category'        => 'Overall Performance',
                'text'            => 'How would you rate your overall job performance this review period?',
                'required'        => true,
                'weight'          => 30,
                'sort_order'      => 1,
                'options'         => $ratingOptions,
            ],
            [
                'evaluation_type' => 'self',
                'type'            => 'rating',
                'category'        => 'Goals & Objectives',
                'text'            => 'How effectively did you achieve the goals set at the beginning of this period?',
                'required'        => true,
                'weight'          => 25,
                'sort_order'      => 2,
                'options'         => $ratingOptions,
            ],
            [
                'evaluation_type' => 'self',
                'type'            => 'text',
                'category'        => 'Accomplishments',
                'text'            => 'Describe your most significant accomplishments this review period.',
                'required'        => true,
                'weight'          => 0,
                'sort_order'      => 3,
                'options'         => [],
            ],
            [
                'evaluation_type' => 'self',
                'type'            => 'rating',
                'category'        => 'Collaboration',
                'text'            => 'How well did you collaborate with your team and cross-functional partners?',
                'required'        => true,
                'weight'          => 25,
                'sort_order'      => 4,
                'options'         => $ratingOptions,
            ],
            [
                'evaluation_type' => 'self',
                'type'            => 'text',
                'category'        => 'Development Areas',
                'text'            => 'What skills or areas would you like to focus on developing in the next period?',
                'required'        => false,
                'weight'          => 0,
                'sort_order'      => 5,
                'options'         => [],
            ],

            // ── Peer Evaluation ───────────────────────────────────────────
            [
                'evaluation_type' => 'peer',
                'type'            => 'rating',
                'category'        => 'Collaboration',
                'text'            => 'How effectively does this employee collaborate and work with the team?',
                'required'        => true,
                'weight'          => 30,
                'sort_order'      => 1,
                'options'         => $ratingOptions,
            ],
            [
                'evaluation_type' => 'peer',
                'type'            => 'rating',
                'category'        => 'Communication',
                'text'            => 'How would you rate this employee\'s communication skills and clarity?',
                'required'        => true,
                'weight'          => 25,
                'sort_order'      => 2,
                'options'         => $ratingOptions,
            ],
            [
                'evaluation_type' => 'peer',
                'type'            => 'rating',
                'category'        => 'Reliability',
                'text'            => 'How consistently does this employee deliver on their commitments?',
                'required'        => true,
                'weight'          => 25,
                'sort_order'      => 3,
                'options'         => $ratingOptions,
            ],
            [
                'evaluation_type' => 'peer',
                'type'            => 'rating',
                'category'        => 'Innovation',
                'text'            => 'How often does this employee bring creative ideas or solutions to the team?',
                'required'        => true,
                'weight'          => 20,
                'sort_order'      => 4,
                'options'         => $ratingOptions,
            ],
            [
                'evaluation_type' => 'peer',
                'type'            => 'text',
                'category'        => 'Feedback',
                'text'            => 'Provide specific examples of how this employee has positively contributed to the team.',
                'required'        => false,
                'weight'          => 0,
                'sort_order'      => 5,
                'options'         => [],
            ],

            // ── Manager Evaluation ────────────────────────────────────────
            [
                'evaluation_type' => 'manager',
                'type'            => 'rating',
                'category'        => 'Goals & Objectives',
                'text'            => 'Rate this employee\'s achievement of their assigned goals and KPIs.',
                'required'        => true,
                'weight'          => 30,
                'sort_order'      => 1,
                'options'         => $ratingOptions,
            ],
            [
                'evaluation_type' => 'manager',
                'type'            => 'rating',
                'category'        => 'Core Competencies',
                'text'            => 'How well does this employee demonstrate the core competencies required for their role?',
                'required'        => true,
                'weight'          => 25,
                'sort_order'      => 2,
                'options'         => $ratingOptions,
            ],
            [
                'evaluation_type' => 'manager',
                'type'            => 'rating',
                'category'        => 'Leadership',
                'text'            => 'To what extent does this employee show leadership potential and initiative?',
                'required'        => true,
                'weight'          => 20,
                'sort_order'      => 3,
                'options'         => $ratingOptions,
            ],
            [
                'evaluation_type' => 'manager',
                'type'            => 'rating',
                'category'        => 'Professionalism',
                'text'            => 'How would you rate this employee\'s professionalism, attendance, and conduct?',
                'required'        => true,
                'weight'          => 25,
                'sort_order'      => 4,
                'options'         => $ratingOptions,
            ],
            [
                'evaluation_type' => 'manager',
                'type'            => 'text',
                'category'        => 'Development',
                'text'            => 'Describe the employee\'s key strengths and areas for improvement in the next period.',
                'required'        => false,
                'weight'          => 0,
                'sort_order'      => 5,
                'options'         => [],
            ],
        ];

        foreach ($questions as $qData) {
            $optionData = $qData['options'];
            unset($qData['options']);

            $question = EvaluationQuestion::updateOrCreate(
                [
                    'template_id'     => $template->id,
                    'evaluation_type' => $qData['evaluation_type'],
                    'sort_order'      => $qData['sort_order'],
                ],
                array_merge($qData, ['template_id' => $template->id])
            );

            // Sync rating options
            if (! empty($optionData)) {
                EvaluationQuestionOption::where('question_id', $question->id)->delete();
                foreach ($optionData as $opt) {
                    EvaluationQuestionOption::create([
                        'question_id' => $question->id,
                        'label'       => $opt['label'],
                        'value'       => $opt['value'],
                        'sort_order'  => $opt['sort_order'],
                    ]);
                }
            }
        }

        $this->command->info("Template '{$template->title}' seeded with " . count($questions) . ' questions.');
    }
}
