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
        $company = Company::where('email', 'hr@tatari.local')->first()
            ?? Company::query()->first();

        if (!$company) {
            return;
        }

        // Deactivate existing active templates
        EvaluationTemplate::where('company_id', $company->id)
            ->where('status', 'active')
            ->update(['status' => 'inactive']);

        $ratingOptions = [
            ['label' => 'Exceptional', 'value' => 5, 'sort_order' => 1],
            ['label' => 'Exceeds Expectations', 'value' => 4, 'sort_order' => 2],
            ['label' => 'Meets Expectations', 'value' => 3, 'sort_order' => 3],
            ['label' => 'Needs Improvement', 'value' => 2, 'sort_order' => 4],
            ['label' => 'Unsatisfactory', 'value' => 1, 'sort_order' => 5],
        ];

        $templates = [

            // SELF TEMPLATE
            [
                'title' => 'Self Evaluation Template',
                'evaluation_type' => 'self',
                'questions' => [
                    [
                        'type' => 'rating',
                        'category' => 'Overall Performance',
                        'text' => 'How would you rate your overall job performance this review period?',
                        'required' => true,
                        'weight' => 30,
                        'sort_order' => 1,
                        'options' => $ratingOptions,
                    ],
                    [
                        'type' => 'text',
                        'category' => 'Accomplishments',
                        'text' => 'Describe your most significant accomplishments this review period.',
                        'required' => true,
                        'weight' => 0,
                        'sort_order' => 2,
                        'options' => [],
                    ],
                ],
            ],

            // PEER TEMPLATE
            [
                'title' => 'Peer Evaluation Template',
                'evaluation_type' => 'peer',
                'questions' => [
                    [
                        'type' => 'rating',
                        'category' => 'Collaboration',
                        'text' => 'How effectively does this employee collaborate and work with the team?',
                        'required' => true,
                        'weight' => 30,
                        'sort_order' => 1,
                        'options' => $ratingOptions,
                    ],
                    [
                        'type' => 'text',
                        'category' => 'Feedback',
                        'text' => 'Provide feedback about this employee.',
                        'required' => false,
                        'weight' => 0,
                        'sort_order' => 2,
                        'options' => [],
                    ],
                ],
            ],

            // MANAGER TEMPLATE
            [
                'title' => 'Manager Evaluation Template',
                'evaluation_type' => 'manager',
                'questions' => [
                    [
                        'type' => 'rating',
                        'category' => 'Goals & Objectives',
                        'text' => 'Rate this employee’s achievement of assigned goals.',
                        'required' => true,
                        'weight' => 30,
                        'sort_order' => 1,
                        'options' => $ratingOptions,
                    ],
                    [
                        'type' => 'text',
                        'category' => 'Development',
                        'text' => 'Describe strengths and improvement areas.',
                        'required' => false,
                        'weight' => 0,
                        'sort_order' => 2,
                        'options' => [],
                    ],
                ],
            ],
        ];

        foreach ($templates as $templateData) {

            $questions = $templateData['questions'];
            unset($templateData['questions']);

            $template = EvaluationTemplate::updateOrCreate(
                [
                    'company_id' => $company->id,
                    'title' => $templateData['title'],
                ],
                [
                    'company_id' => $company->id,
                    'description' => $templateData['title'],
                    'status' => 'active',
                    'evaluation_type' => $templateData['evaluation_type'],
                    'weights' => [
                        $templateData['evaluation_type'] => 100
                    ],
                ]
            );

            foreach ($questions as $qData) {

                $optionData = $qData['options'];
                unset($qData['options']);

                $question = EvaluationQuestion::updateOrCreate(
                    [
                        'template_id' => $template->id,
                        'sort_order' => $qData['sort_order'],
                    ],
                    array_merge($qData, [
                        'template_id' => $template->id,
                    ])
                );

                // Sync options
                EvaluationQuestionOption::where('question_id', $question->id)->delete();

                foreach ($optionData as $opt) {
                    EvaluationQuestionOption::create([
                        'question_id' => $question->id,
                        'label' => $opt['label'],
                        'value' => $opt['value'],
                        'sort_order' => $opt['sort_order'],
                    ]);
                }
            }
        }

        $this->command->info('Evaluation templates seeded successfully.');
    }
}