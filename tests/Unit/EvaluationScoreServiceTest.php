<?php

namespace Tests\Unit;

use App\Models\EvaluationQuestion;
use App\Models\EvaluationQuestionOption;
use App\Services\EvaluationScoreService;
use Illuminate\Database\Eloquent\Collection;
use Tests\TestCase;

class EvaluationScoreServiceTest extends TestCase
{
    private EvaluationScoreService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new EvaluationScoreService();
    }

    private function makeQuestion(int $id, float $weight = 1.0, array $optionValues = []): EvaluationQuestion
    {
        $question = new EvaluationQuestion(['weight' => $weight]);
        $question->id = $id;

        $options = collect();
        foreach ($optionValues as $optId => $value) {
            $opt = new EvaluationQuestionOption(['value' => $value]);
            $opt->id = $optId;
            $options->push($opt);
        }
        $question->setRelation('options', $options);

        return $question;
    }

    public function test_rating_wins_over_options_and_uses_weight(): void
    {
        $q1 = $this->makeQuestion(1, 2.0);
        $q2 = $this->makeQuestion(2, 1.0);

        $score = $this->service->calculate(
            [
                ['question_id' => 1, 'rating' => 4],
                ['question_id' => 2, 'rating' => 2],
            ],
            new Collection([$q1, $q2])
        );

        // (4*2 + 2*1) / (2+1) = 10/3 = 3.33
        $this->assertSame(3.33, $score);
    }

    public function test_single_select_uses_option_value(): void
    {
        $q = $this->makeQuestion(1, 1.0, [10 => 5, 11 => 3]);

        $score = $this->service->calculate(
            [['question_id' => 1, 'selected_options' => [10]]],
            new Collection([$q])
        );

        $this->assertSame(5.00, $score);
    }

    public function test_multi_select_averages_option_values(): void
    {
        $q = $this->makeQuestion(1, 1.0, [10 => 4, 11 => 2, 12 => 6]);

        $score = $this->service->calculate(
            [['question_id' => 1, 'selected_options' => [10, 11, 12]]],
            new Collection([$q])
        );

        // (4 + 2 + 6) / 3 = 4.00
        $this->assertSame(4.00, $score);
    }

    public function test_question_with_no_answer_is_skipped(): void
    {
        $q1 = $this->makeQuestion(1, 1.0);
        $q2 = $this->makeQuestion(2, 1.0);

        $score = $this->service->calculate(
            [['question_id' => 1, 'rating' => 5]],
            new Collection([$q1, $q2])
        );

        // Only q1 contributes: 5*1 / 1 = 5
        $this->assertSame(5.00, $score);
    }

    public function test_all_empty_answers_returns_null(): void
    {
        $q1 = $this->makeQuestion(1, 1.0);
        $q2 = $this->makeQuestion(2, 1.0);

        $score = $this->service->calculate([], new Collection([$q1, $q2]));

        $this->assertNull($score);
    }

    public function test_zero_weight_question_is_skipped(): void
    {
        $q1 = $this->makeQuestion(1, 0.0);
        $q2 = $this->makeQuestion(2, 1.0);

        $score = $this->service->calculate(
            [
                ['question_id' => 1, 'rating' => 1],
                ['question_id' => 2, 'rating' => 4],
            ],
            new Collection([$q1, $q2])
        );

        $this->assertSame(4.00, $score);
    }

    public function test_unknown_question_id_is_ignored(): void
    {
        $q1 = $this->makeQuestion(1, 1.0);

        $score = $this->service->calculate(
            [
                ['question_id' => 1, 'rating' => 3],
                ['question_id' => 999, 'rating' => 5],
            ],
            new Collection([$q1])
        );

        $this->assertSame(3.00, $score);
    }

    public function test_fractional_weight_supported(): void
    {
        $q1 = $this->makeQuestion(1, 1.5);
        $q2 = $this->makeQuestion(2, 0.5);

        $score = $this->service->calculate(
            [
                ['question_id' => 1, 'rating' => 5],
                ['question_id' => 2, 'rating' => 1],
            ],
            new Collection([$q1, $q2])
        );

        // (5*1.5 + 1*0.5) / (1.5+0.5) = 8/2 = 4.00
        $this->assertSame(4.00, $score);
    }

    public function test_rounds_to_two_decimals(): void
    {
        $q1 = $this->makeQuestion(1, 1.0);
        $q2 = $this->makeQuestion(2, 1.0);
        $q3 = $this->makeQuestion(3, 1.0);

        $score = $this->service->calculate(
            [
                ['question_id' => 1, 'rating' => 1],
                ['question_id' => 2, 'rating' => 2],
                ['question_id' => 3, 'rating' => 2],
            ],
            new Collection([$q1, $q2, $q3])
        );

        // (1+2+2)/3 = 1.6666... → 1.67
        $this->assertSame(1.67, $score);
    }

    public function test_selected_options_with_no_matching_option_returns_null(): void
    {
        $q = $this->makeQuestion(1, 1.0, [10 => 5]);

        $score = $this->service->calculate(
            [['question_id' => 1, 'selected_options' => [999]]],
            new Collection([$q])
        );

        $this->assertNull($score);
    }
}
