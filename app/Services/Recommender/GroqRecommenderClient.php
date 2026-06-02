<?php

namespace App\Services\Recommender;

use App\Models\JobVacancy;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class GroqRecommenderClient
{
    public function score(string $cvText, JobVacancy $vacancy): RecommendationResult
    {
        $apiKey = config('services.gemini.api_key');
        if (! $apiKey) {
            throw new RecommenderException('API Key is not configured in GEMINI_API_KEY.');
        }

        $model = config('services.gemini.model', 'llama-3.3-70b-versatile');
        if (str_contains(strtolower($model), 'gemini')) {
            $model = 'llama-3.3-70b-versatile'; // override if user forgot to change the model in .env
        }
        
        $timeout = (int) config('services.gemini.request_timeout', 30);

        $url = 'https://api.groq.com/openai/v1/chat/completions';

        $payload = $this->buildPayload($cvText, $vacancy, $model);

        try {
            $response = Http::withToken($apiKey)
                ->withHeaders(['Content-Type' => 'application/json'])
                ->timeout($timeout)
                ->retry(2, 1500, throw: false)
                ->post($url, $payload);
        } catch (Throwable $e) {
            throw new RecommenderException('Groq request failed: ' . $e->getMessage(), 0, $e);
        }

        if (! $response->successful()) {
            $body = $response->body();
            Log::warning('Groq returned a non-success response', [
                'status' => $response->status(),
                'body' => mb_substr($body, 0, 500),
            ]);
            throw new RecommenderException(
                "Groq API returned HTTP {$response->status()}: " . mb_substr($body, 0, 200)
            );
        }

        $rawText = $this->extractGeneratedText($response->json());
        if ($rawText === null) {
            throw new RecommenderException('Groq response did not contain any generated text.');
        }

        $parsed = $this->parseJson($rawText);
        return $this->toResult($parsed, $model);
    }

    /**
     * @return array<string, mixed>
     */
    private function buildPayload(string $cvText, JobVacancy $vacancy, string $model): array
    {
        $jobDescription = $this->trim($vacancy->description ?? '');
        $requirements = $this->trim($vacancy->requirements ?? '');
        $responsibilities = $this->trim($vacancy->responsibilities ?? '');

        $instruction = <<<PROMPT
You are an experienced technical recruiter screening a CV against a specific job posting. You must respond with strict JSON only — no prose, no markdown, no code fences.

Score the candidate from 0 to 100 based on how well their CV matches the job posting. Use this rubric:
- 85-100: Exceptional match. Has nearly all required experience, skills, and qualifications.
- 75-84: Strong match. Meets most requirements with minor gaps.
- 60-74: Decent match. Worth considering but has notable gaps.
- 40-59: Weak match. Few requirements met.
- 0-39: Poor match. Largely unrelated background.

Choose a verdict:
- "recommended" if score >= 75
- "consider" if score is 60-74
- "not_recommended" if score < 60

Be honest and conservative. Do not invent qualifications. Cite only what the CV actually contains.

Return JSON in EXACTLY this shape:
{
  "score": <number 0-100>,
  "verdict": "recommended" | "consider" | "not_recommended",
  "summary": "<2-3 sentence rationale>",
  "strengths": ["<short bullet>", ...],
  "gaps": ["<short bullet>", ...]
}

--- JOB POSTING ---
Title: {$vacancy->title}
Description:
{$jobDescription}

Requirements:
{$requirements}

Responsibilities:
{$responsibilities}

--- CANDIDATE CV ---
{$cvText}
PROMPT;

        return [
            'model' => $model,
            'messages' => [
                ['role' => 'user', 'content' => $instruction],
            ],
            'temperature' => 0.2,
            'response_format' => ['type' => 'json_object'],
        ];
    }

    private function extractGeneratedText(array $body): ?string
    {
        $content = $body['choices'][0]['message']['content'] ?? null;
        return is_string($content) && $content !== '' ? $content : null;
    }

    /**
     * @return array<string, mixed>
     */
    private function parseJson(string $raw): array
    {
        $trimmed = trim($raw);
        // Defensive: strip ```json fences
        if (str_starts_with($trimmed, '```')) {
            $trimmed = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', $trimmed) ?? $trimmed;
        }

        $decoded = json_decode($trimmed, true);
        if (! is_array($decoded)) {
            throw new RecommenderException('Groq returned invalid JSON: ' . mb_substr($trimmed, 0, 200));
        }

        return $decoded;
    }

    private function toResult(array $data, string $model): RecommendationResult
    {
        $score = isset($data['score']) ? (float) $data['score'] : 0.0;
        $score = max(0.0, min(100.0, $score));

        $verdict = $data['verdict'] ?? null;
        if (! in_array($verdict, ['recommended', 'consider', 'not_recommended'], true)) {
            $verdict = $score >= 75 ? 'recommended' : ($score >= 60 ? 'consider' : 'not_recommended');
        }

        return new RecommendationResult(
            score: round($score, 2),
            verdict: $verdict,
            summary: (string) ($data['summary'] ?? ''),
            strengths: $this->stringList($data['strengths'] ?? []),
            gaps: $this->stringList($data['gaps'] ?? []),
            modelVersion: $model,
        );
    }

    /**
     * @param mixed $value
     * @return string[]
     */
    private function stringList($value): array
    {
        if (! is_array($value)) {
            return [];
        }

        return array_values(array_filter(array_map(
            fn ($item) => is_string($item) ? trim($item) : null,
            $value
        ), fn ($item) => $item !== null && $item !== ''));
    }

    private function trim(string $value): string
    {
        $value = trim($value);
        return $value === '' ? '(none provided)' : $value;
    }
}
