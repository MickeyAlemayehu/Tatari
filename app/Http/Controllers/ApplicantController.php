<?php

namespace App\Http\Controllers;

use App\Models\Applicant;
use App\Models\JobVacancy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class ApplicantController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Applicant::query()
            ->with(['vacancy.department'])
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
        return response()->json($this->payload($applicant->load(['vacancy.department', 'reviewer']), true));
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

        $applicant->update($data);

        return response()->json($this->payload($applicant->fresh()->load(['vacancy.department', 'reviewer']), true));
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
}
