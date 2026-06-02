<?php

namespace App\Services\Recommender;

use App\Models\Applicant;
use App\Models\ApplicantRecommendation;
use App\Models\Employee;
use App\Models\JobVacancy;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Log;
use Throwable;

class ApplicantRecommendationService
{
    public function __construct(
        private readonly CvTextExtractor $extractor,
        private readonly GroqRecommenderClient $client,
        private readonly NotificationService $notifications,
    ) {}

    /**
     * Run the full recommendation pipeline for an applicant.
     *
     * Idempotent by default: if the input_hash matches the last completed
     * run, no Gemini call is made. Pass $force=true to bypass that gate
     * (still hashes inputs and stores them, but always re-queries the API).
     */
    public function recommend(Applicant $applicant, bool $force = false): ApplicantRecommendation
    {
        $applicant->loadMissing('vacancy');
        $vacancy = $applicant->vacancy;

        if (! $vacancy) {
            throw new RecommenderException("Applicant #{$applicant->id} has no vacancy.");
        }

        $recommendation = ApplicantRecommendation::firstOrNew(
            ['applicant_id' => $applicant->id],
            ['vacancy_id' => $vacancy->id]
        );

        $recommendation->vacancy_id = $vacancy->id;
        $recommendation->status = ApplicantRecommendation::STATUS_PROCESSING;
        $recommendation->error_message = null;
        $recommendation->save();

        try {
            $extracted = $this->extractor->extract($applicant->resume_path);

            if ($extracted['status'] === CvTextExtractor::STATUS_MANUAL_REVIEW) {
                $recommendation->status = ApplicantRecommendation::STATUS_MANUAL_REVIEW;
                $recommendation->summary = $extracted['reason'] ?? null;
                $recommendation->error_message = $extracted['reason'] ?? null;
                $recommendation->cv_text_length = strlen($extracted['text']);
                $recommendation->processed_at = now();
                $recommendation->save();
                return $recommendation;
            }

            $cvText = $extracted['text'];
            $modelVersion = (string) config('services.gemini.model', 'gemini-2.0-flash');
            $inputHash = $this->computeHash($cvText, $vacancy, $modelVersion);

            // Idempotency gate: skip the API call when nothing meaningful has changed.
            if (
                ! $force
                && $recommendation->input_hash === $inputHash
                && $recommendation->score !== null
            ) {
                Log::info('Skipping Gemini call: input_hash unchanged', [
                    'applicant_id' => $applicant->id,
                    'hash' => $inputHash,
                ]);
                $recommendation->status = ApplicantRecommendation::STATUS_COMPLETED;
                $recommendation->save();
                return $recommendation;
            }

            $previousScore = $recommendation->score === null ? null : (float) $recommendation->score;

            $result = $this->client->score($cvText, $vacancy);

            $recommendation->fill([
                'status' => ApplicantRecommendation::STATUS_COMPLETED,
                'score' => $result->score,
                'verdict' => $result->verdict,
                'summary' => $result->summary,
                'strengths' => $result->strengths,
                'gaps' => $result->gaps,
                'cv_text_excerpt' => mb_substr($cvText, 0, 2000),
                'cv_text_length' => strlen($cvText),
                'model_version' => $result->modelVersion,
                'input_hash' => $inputHash,
                'processed_at' => now(),
                'error_message' => null,
            ])->save();

            $this->maybeNotifyHr($applicant, $recommendation, $previousScore);

            return $recommendation;
        } catch (Throwable $e) {
            Log::error('Applicant recommendation failed', [
                'applicant_id' => $applicant->id,
                'error' => $e->getMessage(),
            ]);

            $recommendation->status = ApplicantRecommendation::STATUS_FAILED;
            $recommendation->error_message = mb_substr($e->getMessage(), 0, 1000);
            $recommendation->save();

            throw $e;
        }
    }

    private function computeHash(string $cvText, JobVacancy $vacancy, string $modelVersion): string
    {
        $parts = [
            'cv' => $cvText,
            'req' => (string) ($vacancy->requirements ?? ''),
            'desc' => (string) ($vacancy->description ?? ''),
            'resp' => (string) ($vacancy->responsibilities ?? ''),
            'model' => $modelVersion,
        ];

        return hash('sha256', json_encode($parts, JSON_UNESCAPED_UNICODE));
    }

    private function maybeNotifyHr(Applicant $applicant, ApplicantRecommendation $rec, ?float $previousScore): void
    {
        $threshold = (float) config('services.gemini.recommendation_threshold', 75);
        $score = (float) $rec->score;

        if ($score < $threshold) {
            return;
        }

        // Don't re-notify on every re-analysis. Only notify if:
        //  - we've never notified for this applicant, OR
        //  - the previous score was below the threshold (newly crossed it).
        $previousWasBelow = $previousScore === null || $previousScore < $threshold;
        if ($rec->notified_at && ! $previousWasBelow) {
            return;
        }

        $name = trim("{$applicant->first_name} {$applicant->last_name}");
        $vacancy = $applicant->vacancy;
        $role = $vacancy?->title ?? 'an open role';
        $scoreLabel = number_format($score, 0);

        $recipients = Employee::query()
            ->where('status', 'active')
            ->get()
            ->filter(fn (Employee $e) => $e->hasPermission('manage_employees'))
            ->values();

        if ($recipients->isEmpty()) {
            return;
        }

        $this->notifications->notifyMany(
            $recipients,
            'recruitment',
            'Strong applicant detected',
            "{$name} scored {$scoreLabel}% for {$role}.",
            $applicant
        );

        $rec->notified_at = now();
        $rec->save();
    }
}
