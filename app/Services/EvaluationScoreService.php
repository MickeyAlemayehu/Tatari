<?php

namespace App\Services;

use App\Models\EvaluationQuestion;
use Illuminate\Support\Collection;

/**
 * Single source of truth for evaluation scoring.
 *
 * Scoring rules per answer:
 *   1. If `rating` is numeric → use it as raw_score.
 *   2. Else if `selected_options` is non-empty →
 *        raw_score = avg(value of each selected option). Multi-select
 *        uses average so the result stays in the same range as
 *        single-select scoring.
 *   3. Else → question contributes nothing.
 *
 * Weighted aggregation:
 *   weighted_score = raw_score × question.weight
 *   final_score    = sum(weighted_scores) / sum(weights of scored questions)
 *
 * Zero-weight or negative-weight questions are silently skipped.
 * Returns null when no question produces a score (no div-by-zero).
 * Result is rounded to 2 decimal places.
 */
class EvaluationScoreService
{
    /**
     * @param  iterable<array{question_id?:int|string,rating?:mixed,selected_options?:array<int,int|string>|null}>  $answers
     * @param  Collection<int, EvaluationQuestion>  $questions  Indexed however; lookup is by id.
     */
    public function calculate(iterable $answers, Collection $questions): ?float
    {
        $questionsById = $questions->keyBy('id');

        $weightedSum = 0.0;
        $weightTotal = 0.0;

        foreach ($answers as $answer) {
            $questionId = $answer['question_id'] ?? null;
            if ($questionId === null) {
                continue;
            }

            /** @var EvaluationQuestion|null $question */
            $question = $questionsById->get((int) $questionId);
            if (! $question) {
                continue;
            }

            $weight = (float) ($question->weight ?? 1);
            if ($weight <= 0) {
                continue;
            }

            $raw = $this->rawScore($answer, $question);
            if ($raw === null) {
                continue;
            }

            $weightedSum += $raw * $weight;
            $weightTotal += $weight;
        }

        if ($weightTotal <= 0) {
            return null;
        }

        return round($weightedSum / $weightTotal, 2);
    }

    /**
     * @param  array<string,mixed>  $answer
     */
    private function rawScore(array $answer, EvaluationQuestion $question): ?float
    {
        $rating = $answer['rating'] ?? null;
        if (is_numeric($rating)) {
            return (float) $rating;
        }

        $selected = $answer['selected_options'] ?? null;
        if (is_array($selected) && count($selected) > 0) {
            $selectedIds = array_map('intval', $selected);
            $options = $question->relationLoaded('options')
                ? $question->options
                : $question->options()->whereIn('id', $selectedIds)->get();

            $values = $options
                ->whereIn('id', $selectedIds)
                ->map(fn ($o) => (float) $o->value);

            if ($values->isEmpty()) {
                return null;
            }

            return (float) ($values->sum() / $values->count());
        }

        return null;
    }
}
