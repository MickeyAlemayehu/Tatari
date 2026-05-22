<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Employee;
use App\Models\EvaluationAssignment;
use App\Models\EvaluationPeriod;
use App\Models\PerformanceEvaluation;
use App\Models\PerformanceSummary;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class PerformanceEvaluationWorkflowController extends Controller
{
    public function periods(Request $request): JsonResponse
    {
        $query = EvaluationPeriod::query()
            ->withCount(['assignments', 'evaluations'])
            ->latest('start_date');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json([
            'data' => $query->get()->map(fn (EvaluationPeriod $period) => $this->periodPayload($period)),
        ]);
    }

    public function storePeriod(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => ['nullable', 'integer', 'exists:companies,id'],
            'name' => ['required', 'string', 'max:150'],
            'start_date' => ['required', 'date'],
            'startDate' => ['sometimes', 'date'],
            'end_date' => ['required_without:endDate', 'date', 'after:start_date'],
            'endDate' => ['sometimes', 'date'],
            'status' => ['sometimes', 'string', Rule::in(['draft', 'active', 'upcoming', 'completed'])],
        ]);

        $period = EvaluationPeriod::create([
            'company_id' => $data['company_id'] ?? Company::query()->orderBy('id')->value('id'),
            'name' => $data['name'],
            'start_date' => $data['start_date'] ?? $data['startDate'],
            'end_date' => $data['end_date'] ?? $data['endDate'],
            'status' => $data['status'] ?? 'active',
        ]);

        return response()->json($this->periodPayload($period->loadCount(['assignments', 'evaluations'])), Response::HTTP_CREATED);
    }

    public function assignments(Request $request): JsonResponse
    {
        $employee = $request->user('api') ?? $request->user();

        $query = EvaluationAssignment::query()
            ->with(['period', 'employee.department', 'evaluator.department', 'evaluation'])
            ->latest('assigned_at');

        if (! $employee->hasPermission('performance_create')) {
            $query->where(fn ($q) => $q->where('employee_id', $employee->id)->orWhere('evaluator_id', $employee->id));
        }

        if ($request->filled('evaluator_id')) {
            $query->where('evaluator_id', $request->integer('evaluator_id'));
        }

        return response()->json([
            'data' => $query->get()->map(fn (EvaluationAssignment $assignment) => $this->assignmentPayload($assignment)),
        ]);
    }

    public function myAssignments(Request $request): JsonResponse
    {
        $employee = $request->user('api') ?? $request->user();

        return response()->json([
            'data' => EvaluationAssignment::query()
                ->with(['period', 'employee.department', 'evaluator.department', 'evaluation'])
                ->where('evaluator_id', $employee->id)
                ->latest('assigned_at')
                ->get()
                ->map(fn (EvaluationAssignment $assignment) => $this->assignmentPayload($assignment)),
        ]);
    }

    public function assignPeers(Request $request): JsonResponse
    {
        $assigner = $request->user('api') ?? $request->user();
        $data = $request->validate([
            'evaluation_period_id' => ['required', 'integer', 'exists:evaluation_periods,id'],
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
            'peer_ids' => ['required', 'array', 'min:1', 'max:8'],
            'peer_ids.*' => ['integer', 'exists:employees,id', 'different:employee_id'],
            'manager_id' => ['nullable', 'integer', 'exists:employees,id'],
            'include_self' => ['sometimes', 'boolean'],
        ]);

        $created = collect();

        if ($data['include_self'] ?? true) {
            $created->push($this->assignment($data['evaluation_period_id'], $data['employee_id'], $data['employee_id'], 'self', $assigner->id));
        }

        foreach (array_unique($data['peer_ids']) as $peerId) {
            $created->push($this->assignment($data['evaluation_period_id'], $data['employee_id'], $peerId, 'peer', $assigner->id));
        }

        if (! empty($data['manager_id'])) {
            $created->push($this->assignment($data['evaluation_period_id'], $data['employee_id'], $data['manager_id'], 'manager', $assigner->id));
        }

        return response()->json([
            'message' => 'Evaluators assigned.',
            'data' => $created->map(fn (EvaluationAssignment $assignment) => $this->assignmentPayload($assignment->load(['period', 'employee.department', 'evaluator.department', 'evaluation']))),
        ], Response::HTTP_CREATED);
    }

    public function submitEvaluation(Request $request, EvaluationAssignment $assignment): JsonResponse
    {
        $evaluator = $request->user('api') ?? $request->user();

        if ($assignment->evaluator_id !== $evaluator->id && ! $evaluator->hasPermission('performance_evaluate')) {
            abort(Response::HTTP_FORBIDDEN, 'Not allowed to submit this evaluation.');
        }

        $data = $request->validate([
            'score' => ['nullable', 'numeric', 'between:1,5'],
            'rating' => ['nullable', 'numeric', 'between:1,5'],
            'comments' => ['nullable', 'string'],
            'answers' => ['nullable', 'array'],
        ]);

        $score = $data['score'] ?? $data['rating'] ?? $this->scoreFromAnswers($data['answers'] ?? []);

        if (! $score) {
            return response()->json(['message' => 'Score or rating answers are required.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $evaluation = PerformanceEvaluation::updateOrCreate(
            ['assignment_id' => $assignment->id],
            [
                'evaluator_id' => $assignment->evaluator_id,
                'employee_id' => $assignment->employee_id,
                'evaluation_period_id' => $assignment->evaluation_period_id,
                'score' => $score,
                'comments' => $data['comments'] ?? json_encode($data['answers'] ?? []),
                'submitted_at' => now(),
                'status' => 'submitted',
            ]
        );

        $this->recalculateSummary($assignment->employee_id, $assignment->evaluation_period_id);

        return response()->json($this->evaluationPayload($evaluation->load(['assignment', 'employee.department', 'evaluator'])), Response::HTTP_CREATED);
    }

    public function results(Request $request): JsonResponse
    {
        $query = PerformanceSummary::query()
            ->with(['employee.department', 'period'])
            ->latest('calculated_at');

        if ($request->filled('evaluation_period_id')) {
            $query->where('evaluation_period_id', $request->integer('evaluation_period_id'));
        }

        return response()->json([
            'data' => $query->get()->map(fn (PerformanceSummary $summary) => $this->summaryPayload($summary)),
        ]);
    }

    public function myResults(Request $request): JsonResponse
    {
        $employee = $request->user('api') ?? $request->user();

        return response()->json([
            'data' => PerformanceSummary::query()
                ->with(['employee.department', 'period'])
                ->where('employee_id', $employee->id)
                ->latest('calculated_at')
                ->get()
                ->map(fn (PerformanceSummary $summary) => $this->summaryPayload($summary)),
        ]);
    }

    private function assignment(int $periodId, int $employeeId, int $evaluatorId, string $type, ?int $assignedBy): EvaluationAssignment
    {
        return EvaluationAssignment::updateOrCreate(
            [
                'evaluation_period_id' => $periodId,
                'employee_id' => $employeeId,
                'evaluator_id' => $evaluatorId,
                'evaluator_type' => $type,
            ],
            [
                'assigned_by' => $assignedBy,
                'assigned_at' => now(),
            ]
        );
    }

    private function recalculateSummary(int $employeeId, int $periodId): PerformanceSummary
    {
        $evaluations = PerformanceEvaluation::query()
            ->where('employee_id', $employeeId)
            ->where('evaluation_period_id', $periodId)
            ->with('assignment')
            ->get();

        $scoreFor = fn (string $type) => $evaluations
            ->filter(fn (PerformanceEvaluation $evaluation) => $evaluation->assignment?->evaluator_type === $type)
            ->avg('score');

        $self = $scoreFor('self');
        $peer = $scoreFor('peer');
        $manager = $scoreFor('manager');
        $scores = collect([$self, $peer, $manager])->filter(fn ($score) => $score !== null);

        return PerformanceSummary::updateOrCreate(
            ['employee_id' => $employeeId, 'evaluation_period_id' => $periodId],
            [
                'self_score' => $self,
                'peer_score' => $peer,
                'manager_score' => $manager,
                'final_score' => $scores->count() ? round($scores->avg(), 2) : null,
                'calculated_at' => now(),
            ]
        );
    }

    private function scoreFromAnswers(array $answers): ?float
    {
        $ratings = collect($answers)->pluck('rating')->filter(fn ($rating) => is_numeric($rating));

        return $ratings->count() ? round($ratings->avg(), 2) : null;
    }

    private function periodPayload(EvaluationPeriod $period): array
    {
        $total = $period->assignments_count ?? $period->assignments()->count();
        $completed = $period->evaluations_count ?? $period->evaluations()->count();

        return [
            'id' => $period->id,
            'title' => $period->name,
            'name' => $period->name,
            'startDate' => $period->start_date?->toDateString(),
            'endDate' => $period->end_date?->toDateString(),
            'status' => $period->status,
            'completed' => $completed,
            'totalEmployees' => $total,
            'progress' => $total ? round(($completed / $total) * 100) : 0,
        ];
    }

    private function assignmentPayload(EvaluationAssignment $assignment): array
    {
        return [
            'id' => $assignment->id,
            'evaluation_period_id' => $assignment->evaluation_period_id,
            'period' => $assignment->period?->name,
            'employee_id' => $assignment->employee_id,
            'employee' => $this->employeePayload($assignment->employee),
            'evaluator_id' => $assignment->evaluator_id,
            'evaluator' => $this->employeePayload($assignment->evaluator),
            'type' => $assignment->evaluator_type,
            'status' => $assignment->evaluation ? $assignment->evaluation->status : 'pending',
            'score' => $assignment->evaluation?->score === null ? null : (float) $assignment->evaluation->score,
        ];
    }

    private function evaluationPayload(PerformanceEvaluation $evaluation): array
    {
        return [
            'id' => $evaluation->id,
            'assignment_id' => $evaluation->assignment_id,
            'employee_id' => $evaluation->employee_id,
            'evaluator_id' => $evaluation->evaluator_id,
            'evaluation_period_id' => $evaluation->evaluation_period_id,
            'type' => $evaluation->assignment?->evaluator_type,
            'score' => (float) $evaluation->score,
            'comments' => $evaluation->comments,
            'status' => $evaluation->status,
            'submittedAt' => $evaluation->submitted_at?->toISOString(),
        ];
    }

    private function summaryPayload(PerformanceSummary $summary): array
    {
        $status = $summary->final_score ? 'completed' : 'in-progress';

        return [
            'id' => $summary->id,
            'employee_id' => $summary->employee_id,
            'employeeName' => $summary->employee ? trim("{$summary->employee->first_name} {$summary->employee->last_name}") : null,
            'department' => $summary->employee?->department?->name,
            'position' => $summary->employee?->position,
            'period' => $summary->period?->name,
            'selfScore' => $summary->self_score === null ? 0 : (float) $summary->self_score,
            'peerScore' => $summary->peer_score === null ? 0 : (float) $summary->peer_score,
            'managerScore' => $summary->manager_score === null ? 0 : (float) $summary->manager_score,
            'finalScore' => $summary->final_score === null ? 0 : (float) $summary->final_score,
            'status' => $status,
        ];
    }

    private function employeePayload(?Employee $employee): ?array
    {
        if (! $employee) {
            return null;
        }

        return [
            'id' => $employee->id,
            'name' => trim("{$employee->first_name} {$employee->last_name}"),
            'position' => $employee->position,
            'department' => $employee->department?->name,
            'avatar' => strtoupper(substr($employee->first_name, 0, 1).substr($employee->last_name, 0, 1)),
        ];
    }
}
