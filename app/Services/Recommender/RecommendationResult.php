<?php

namespace App\Services\Recommender;

class RecommendationResult
{
    /**
     * @param float $score 0-100
     * @param string $verdict recommended | consider | not_recommended
     * @param string[] $strengths
     * @param string[] $gaps
     */
    public function __construct(
        public readonly float $score,
        public readonly string $verdict,
        public readonly string $summary,
        public readonly array $strengths,
        public readonly array $gaps,
        public readonly string $modelVersion,
    ) {}
}
