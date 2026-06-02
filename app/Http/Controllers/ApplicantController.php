<?php

namespace App\Http\Controllers;

use App\Mail\ApplicantStatusUpdated;
use App\Models\Applicant;
use App\Models\JobVacancy;
use App\Events\ApplicantStatusChanged;
use App\Events\InterviewScheduled;
use App\Jobs\ProcessApplicantRecommendation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class ApplicantController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Applicant::query()
            ->with(['vacancy.department', 'recommendation'])
            ->latest('applied_at');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('vacancy_id')) {
            $query->where('vacancy_id', $request->integer('vacancy_id'));
        }

        return response()->json($query->paginate($request->integer('per_page', 15))
            ->through(fn (Applicant $applicant) => $this->payload($applicant)));
    }

    public function show(Applicant $applicant): JsonResponse
    {
        return response()->json($this->payload($applicant->load(['vacancy.department', 'reviewer', 'recommendation']), true));
    }

    public function apply(Request $request, JobVacancy $jobVacancy): JsonResponse
    {
        if ($jobVacancy->status !== 'open' || $jobVacancy->closing_date->isPast()) {
            return response()->json(['message' => 'This job is not accepting applications.'], Response::HTTP_CONFLICT);
        }

        $data = $request->validate([
            'first_name' => ['nullable', 'string', 'max:100', 'required_without:firstName'],
            'firstName' => ['nullable', 'string', 'max:100', 'required_without:first_name'],
            'last_name' => ['nullable', 'string', 'max:100', 'required_without:lastName'],
            'lastName' => ['nullable', 'string', 'max:100', 'required_without:last_name'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'location' => ['nullable', 'string', 'max:255'],
            'experience' => ['nullable', 'string', 'max:100'],
            'cover_letter' => ['nullable', 'string', 'required_without:coverLetter'],
            'coverLetter' => ['nullable', 'string', 'required_without:cover_letter'],
            'resume' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
            'resume_path' => ['nullable', 'string', 'max:255'],
        ]);

        $resumePath = $data['resume_path'] ?? null;
        if ($request->hasFile('resume')) {
            $resumePath = $request->file('resume')->store('resumes', 'public');
        }

        $applicant = Applicant::create([
            'vacancy_id' => $jobVacancy->id,
            'first_name' => $data['first_name'] ?? $data['firstName'],
            'last_name' => $data['last_name'] ?? $data['lastName'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'location' => $data['location'] ?? null,
            'experience' => $data['experience'] ?? null,
            'resume_path' => $resumePath,
            'cover_letter' => $data['cover_letter'] ?? $data['coverLetter'],
            'status' => 'new',
            'applied_at' => now(),
        ]);

        // Kick off AI screening in the background. Failures never block the
        // applicant's submission — the queue worker retries on its own.
        ProcessApplicantRecommendation::dispatch($applicant->id);

        return response()->json($this->payload($applicant->load('vacancy.department')), Response::HTTP_CREATED);
    }

    public function update(Request $request, Applicant $applicant): JsonResponse
    {
        $reviewer = $request->user('api') ?? $request->user();

        $data = $request->validate([
            'status' => ['sometimes', 'string', Rule::in(['new', 'reviewing', 'shortlisted', 'rejected', 'hired', 'interview_scheduled'])],
            'rating' => ['nullable', 'numeric', 'between:0,5'],
            'rejection_reason' => ['nullable', 'string', 'max:2000'],
            'location' => ['nullable', 'string', 'max:255'],
            'experience' => ['nullable', 'string', 'max:100'],
            'current_company' => ['nullable', 'string', 'max:255'],
            'education' => ['nullable', 'string', 'max:255'],
            'notice_period' => ['nullable', 'string', 'max:100'],
            'interview_at' => ['nullable', 'date'],
        ]);

        if (array_key_exists('status', $data)) {
            $data['reviewed_by'] = $reviewer?->id;
            $data['reviewed_at'] = now();
        }

        $previousStatus = $applicant->status;
        $applicant->update($data);

        if (
            array_key_exists('status', $data)
            && $data['status'] !== $previousStatus
            && in_array($data['status'], ['hired', 'rejected', 'shortlisted', 'interview_scheduled'], true)
        ) {
            $this->sendStatusNotification($applicant->fresh()->load('vacancy'), $data['status']);
        }

        if (array_key_exists('status', $data) && $data['status'] !== $previousStatus) {
            event(new ApplicantStatusChanged(
                $applicant->fresh(),
                $previousStatus,
                $data['status'],
                $reviewer?->id
            ));

            if ($data['status'] === 'interview_scheduled') {
                event(new InterviewScheduled($applicant->fresh()));
            }
        }

        return response()->json($this->payload($applicant->fresh()->load(['vacancy.department', 'reviewer', 'recommendation']), true));
    }

    public function downloadResume(Applicant $applicant)
    {
        if (! $applicant->resume_path) {
            return response()->json(['message' => 'This applicant has no resume on file.'], Response::HTTP_NOT_FOUND);
        }

        if (! Storage::disk('public')->exists($applicant->resume_path)) {
            return response()->json(['message' => 'Resume file is missing on the server.'], Response::HTTP_NOT_FOUND);
        }

        $extension    = strtolower(pathinfo($applicant->resume_path, PATHINFO_EXTENSION));
        $friendlyName = trim("{$applicant->first_name} {$applicant->last_name}");
        $friendlyName = preg_replace('/[^A-Za-z0-9\- ]/', '', $friendlyName);
        $friendlyName = trim($friendlyName) ?: "applicant-{$applicant->id}";
        $downloadName = str_replace(' ', '_', $friendlyName) . '-Resume.' . $extension;

        return Storage::disk('public')->download($applicant->resume_path, $downloadName);
    }

    public function refreshRecommendation(Applicant $applicant): JsonResponse
    {
        ProcessApplicantRecommendation::dispatch($applicant->id, true);

        return response()->json([
            'message' => 'Recommendation re-analysis queued.',
            'applicantId' => $applicant->id,
        ], Response::HTTP_ACCEPTED);
    }

    private function sendStatusNotification(Applicant $applicant, string $status): void
    {
        if (! $applicant->email) {
            return;
        }

        try {
            Mail::to($applicant->email)->send(new ApplicantStatusUpdated($applicant, $status));
        } catch (\Throwable $e) {
            // Mailer failures must never block a successful status update. Log and move on.
            Log::error('Failed to send applicant status email', [
                'applicant_id' => $applicant->id,
                'status'       => $status,
                'error'        => $e->getMessage(),
            ]);
        }
    }

    public function payload(Applicant $applicant, bool $includeDetails = false): array
    {
        $name = trim("{$applicant->first_name} {$applicant->last_name}");

        $payload = [
            'id' => $applicant->id,
            'name' => $name,
            'firstName' => $applicant->first_name,
            'lastName' => $applicant->last_name,
            'email' => $applicant->email,
            'phone' => $applicant->phone,
            'jobTitle' => $applicant->vacancy?->title,
            'jobId' => $applicant->vacancy_id,
            'department' => $applicant->vacancy?->department?->name,
            'appliedDate' => $applicant->applied_at?->toDateString(),
            'status' => $applicant->status,
            'experience' => $applicant->experience,
            'location' => $applicant->location,
            'avatar' => strtoupper(substr($applicant->first_name, 0, 1).substr($applicant->last_name, 0, 1)),
            'rating' => $applicant->rating === null ? null : (float) $applicant->rating,
            'interviewAt' => $applicant->interview_at?->toIso8601String(),
            'recommendation' => $this->recommendationPayload($applicant, $includeDetails),
        ];

        if ($includeDetails) {
            $payload['coverLetter'] = $applicant->cover_letter;
            $payload['resumePath'] = $applicant->resume_path;
            $payload['currentCompany'] = $applicant->current_company;
            $payload['education'] = $applicant->education;
            $payload['noticePeriod'] = $applicant->notice_period;
            $payload['rejectionReason'] = $applicant->rejection_reason;
        }

        return $payload;
    }

    private function recommendationPayload(Applicant $applicant, bool $includeDetails): ?array
    {
        $rec = $applicant->relationLoaded('recommendation') ? $applicant->recommendation : null;
        if (! $rec) {
            return null;
        }

        $base = [
            'status' => $rec->status,
            'score' => $rec->score === null ? null : (float) $rec->score,
            'verdict' => $rec->verdict,
            'processedAt' => $rec->processed_at?->toIso8601String(),
        ];

        if ($includeDetails) {
            $base['summary'] = $rec->summary;
            $base['strengths'] = $rec->strengths ?? [];
            $base['gaps'] = $rec->gaps ?? [];
            $base['modelVersion'] = $rec->model_version;
            $base['errorMessage'] = $rec->error_message;
        }

        return $base;
    }
}
