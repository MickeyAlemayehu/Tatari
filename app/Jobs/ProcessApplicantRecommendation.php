<?php

namespace App\Jobs;

use App\Models\Applicant;
use App\Services\Recommender\ApplicantRecommendationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessApplicantRecommendation implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;
    public int $timeout = 120;

    public function __construct(
        public readonly int $applicantId,
        public readonly bool $force = false,
    ) {
        $this->onQueue('recommendations');
    }

    /**
     * Exponential-ish backoff: 1m, 5m, 15m. Tolerates Gemini rate limits.
     *
     * @return array<int, int>
     */
    public function backoff(): array
    {
        return [60, 300, 900];
    }

    public function handle(ApplicantRecommendationService $service): void
    {
        $applicant = Applicant::with('vacancy')->find($this->applicantId);
        if (! $applicant) {
            return;
        }

        $service->recommend($applicant, $this->force);
    }
}
