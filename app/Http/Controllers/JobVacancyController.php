<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Department;
use App\Models\JobVacancy;
use App\Jobs\ProcessApplicantRecommendation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class JobVacancyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = JobVacancy::query()
            ->with(['department', 'company'])
            ->withCount('applicants')
            ->latest('opening_date');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->integer('department_id'));
        }

        return response()->json($query->paginate($request->integer('per_page', 15))
            ->through(fn (JobVacancy $job) => $this->payload($job)));
    }

    public function publicIndex(Request $request): JsonResponse
    {
        $query = JobVacancy::query()
            ->with(['department', 'company'])
            ->withCount('applicants')
            ->where('status', 'open')
            ->whereDate('closing_date', '>=', now()->toDateString())
            ->latest('opening_date');

        if ($request->filled('department')) {
            $query->whereHas('department', fn ($q) => $q->where('name', $request->string('department')));
        }

        if ($request->filled('type')) {
            $query->where('employment_type', $this->normalizeEmploymentType($request->string('type')));
        }

        return response()->json([
            'data' => $query->get()->map(fn (JobVacancy $job) => $this->payload($job)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $data['company_id'] ??= $this->companyIdForDepartment((int) $data['department_id']);
        $data['created_by'] = ($request->user('api') ?? $request->user())?->id;
        $data['status'] ??= 'open';

        $job = JobVacancy::create($data);

        return response()->json($this->payload($job->load(['department', 'company'])->loadCount('applicants')), Response::HTTP_CREATED);
    }

    public function show(JobVacancy $jobVacancy): JsonResponse
    {
        return response()->json($this->payload($jobVacancy->load(['department', 'company'])->loadCount('applicants'), true));
    }

    public function publicShow(JobVacancy $jobVacancy): JsonResponse
    {
        if ($jobVacancy->status !== 'open') {
            abort(Response::HTTP_NOT_FOUND);
        }

        return response()->json($this->payload($jobVacancy->load(['department', 'company'])->loadCount('applicants'), true));
    }

    public function update(Request $request, JobVacancy $jobVacancy): JsonResponse
    {
        $data = $this->validated($request, true);

        if (isset($data['department_id']) && ! isset($data['company_id'])) {
            $data['company_id'] = $this->companyIdForDepartment((int) $data['department_id']);
        }

        $scoringFields = ['requirements', 'description', 'responsibilities'];
        $requiresRescore = false;
        foreach ($scoringFields as $field) {
            if (array_key_exists($field, $data) && ($data[$field] ?? '') !== ($jobVacancy->getOriginal($field) ?? '')) {
                $requiresRescore = true;
                break;
            }
        }

        $jobVacancy->update($data);

        if ($requiresRescore) {
            $this->requeueApplicantRecommendations($jobVacancy);
        }

        return response()->json($this->payload($jobVacancy->fresh()->load(['department', 'company'])->loadCount('applicants'), true));
    }

    /**
     * When a vacancy's scoring inputs change, re-queue every applicant so
     * their AI score reflects the new requirements. Spread the dispatches
     * out to respect Gemini's free-tier rate limit.
     */
    private function requeueApplicantRecommendations(JobVacancy $vacancy): void
    {
        $applicants = $vacancy->applicants()->select('id')->get();
        if ($applicants->isEmpty()) {
            return;
        }

        foreach ($applicants->values() as $index => $applicant) {
            ProcessApplicantRecommendation::dispatch($applicant->id, true)
                ->delay(now()->addSeconds(15 * $index));
        }
    }

    public function destroy(JobVacancy $jobVacancy): JsonResponse
    {
        if ($jobVacancy->applicants()->exists()) {
            return response()->json(['message' => 'Cannot delete a job with applicants.'], Response::HTTP_CONFLICT);
        }

        $jobVacancy->delete();

        return response()->json(['message' => 'Job vacancy deleted.']);
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        $data = $request->validate([
            'company_id' => ['sometimes', 'integer', 'exists:companies,id'],
            'department_id' => [$partial ? 'sometimes' : 'required_without:department', 'integer', 'exists:departments,id'],
            'department' => [$partial ? 'sometimes' : 'required_without:department_id', 'string', 'max:150'],
            'title' => [$required, 'string', 'max:255'],
            'description' => [$required, 'string'],
            'responsibilities' => ['nullable'],
            'requirements' => ['nullable'],
            'benefits' => ['nullable'],
            'employment_type' => ['sometimes', 'string', Rule::in(['full-time', 'part-time', 'contract', 'internship'])],
            'type' => ['sometimes', 'string', Rule::in(['Full-time', 'Part-time', 'Contract', 'Internship'])],
            'number_of_positions' => ['sometimes', 'integer', 'min:1'],
            'positions' => ['sometimes', 'integer', 'min:1'],
            'opening_date' => ['sometimes', 'date'],
            'closing_date' => [$partial ? 'sometimes' : 'required_without:deadline', 'date'],
            'deadline' => [$partial ? 'sometimes' : 'required_without:closing_date', 'date'],
            'location' => ['nullable', 'string', 'max:255'],
            'salary_min' => ['nullable', 'numeric', 'min:0'],
            'salary_max' => ['nullable', 'numeric', 'min:0'],
            'salaryMin' => ['nullable', 'numeric', 'min:0'],
            'salaryMax' => ['nullable', 'numeric', 'min:0'],
            'salary_text' => ['nullable', 'string', 'max:255'],
            'status' => ['sometimes', 'string', Rule::in(['open', 'closed', 'draft', 'on-hold'])],
        ]);

        if (isset($data['department']) && ! isset($data['department_id'])) {
            $department = Department::where('name', $data['department'])->first();
            if (! $department) {
                abort(Response::HTTP_UNPROCESSABLE_ENTITY, 'Invalid department.');
            }
            $data['department_id'] = $department->id;
        }

        $data['employment_type'] = $data['employment_type'] ?? (isset($data['type']) ? $this->normalizeEmploymentType($data['type']) : 'full-time');
        $data['number_of_positions'] = $data['number_of_positions'] ?? (int) ($data['positions'] ?? 1);
        $data['opening_date'] = $data['opening_date'] ?? now()->toDateString();
        $data['closing_date'] = $data['closing_date'] ?? ($data['deadline'] ?? null);
        $data['salary_min'] = $data['salary_min'] ?? ($data['salaryMin'] ?? null);
        $data['salary_max'] = $data['salary_max'] ?? ($data['salaryMax'] ?? null);

        foreach (['responsibilities', 'requirements', 'benefits'] as $field) {
            if (isset($data[$field]) && is_array($data[$field])) {
                $data[$field] = implode("\n", $data[$field]);
            }
        }

        return collect($data)->only([
            'company_id',
            'department_id',
            'title',
            'description',
            'responsibilities',
            'requirements',
            'benefits',
            'employment_type',
            'number_of_positions',
            'opening_date',
            'closing_date',
            'location',
            'salary_min',
            'salary_max',
            'salary_text',
            'status',
        ])->all();
    }

    private function companyIdForDepartment(int $departmentId): int
    {
        return (int) Department::whereKey($departmentId)->value('company_id')
            ?: (int) Company::query()->orderBy('id')->value('id');
    }

    private function normalizeEmploymentType(string $type): string
    {
        return strtolower($type);
    }

    public function payload(JobVacancy $job, bool $includeDetails = false): array
    {
        $salary = $job->salary_text;
        if (! $salary && ($job->salary_min || $job->salary_max)) {
            $salary = trim('$'.number_format((float) $job->salary_min).' - $'.number_format((float) $job->salary_max));
        }

        $payload = [
            'id' => $job->id,
            'title' => $job->title,
            'department_id' => $job->department_id,
            'department' => $job->department?->name,
            'company_id' => $job->company_id,
            'location' => $job->location,
            'type' => ucwords($job->employment_type),
            'employment_type' => $job->employment_type,
            'status' => $job->status,
            'applicants' => $job->applicants_count ?? $job->applicants()->count(),
            'postedDate' => $job->opening_date?->toDateString(),
            'closingDate' => $job->closing_date?->toDateString(),
            'salary' => $salary,
            'salary_min' => $job->salary_min,
            'salary_max' => $job->salary_max,
            'description' => $job->description,
        ];

        if ($includeDetails) {
            $payload['requirements'] = $this->lines($job->requirements);
            $payload['responsibilities'] = $this->lines($job->responsibilities);
            $payload['benefits'] = $this->lines($job->benefits);
            $payload['positions'] = $job->number_of_positions;
        }

        return $payload;
    }

    private function lines(?string $value): array
    {
        return collect(preg_split('/\r\n|\r|\n/', (string) $value))
            ->map(fn ($line) => trim($line))
            ->filter()
            ->values()
            ->all();
    }
}
