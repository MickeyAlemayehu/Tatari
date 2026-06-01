<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Employee;
use App\Models\EvaluationAnswer;
use App\Models\EvaluationAssignment;
use App\Models\EvaluationPeriod;
use App\Models\EvaluationQuestion;
use App\Models\EvaluationTemplate;
use App\Models\PerformanceEvaluation;
use App\Models\PerformanceSummary;
use App\Services\SelfEvaluationAutoAssigner;
use App\Services\EvaluationScoreService;
use App\Events\EvaluatorsAssigned;
use App\Events\EvaluationSubmitted;
use App\Events\EvaluationPeriodActivated;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class PerformanceEvaluationWorkflowController extends Controller
{
    public function periods(Request $request): JsonResponse
    {
        $query = EvaluationPeriod::query()
            ->with(['templates.department'])
            ->withCount(['assignments', 'evaluations'])
            ->latest('start_date');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json([
            'data' => $query->get()->map(fn (EvaluationPeriod $period) => $this->periodPayload($period)),
        ]);
    }

    public function getPeriod(EvaluationPeriod $period): JsonResponse
    {
        $period->load(['templates.department'])->loadCount(['assignments', 'evaluations']);
        return response()->json($this->periodPayload($period));
    }

    public function storePeriod(Request $request, SelfEvaluationAutoAssigner $autoAssigner): JsonResponse
    {
        $data = $request->validate([
            'company_id'  => ['nullable', 'integer', 'exists:companies,id'],
            'name'        => ['required', 'string', 'max:150'],
            'start_date'  => ['required', 'date'],
            'startDate'   => ['sometimes', 'date'],
            'end_date'    => ['required_without:endDate', 'date', 'after:start_date'],
            'endDate'     => ['sometimes', 'date'],
            'status'      => ['sometimes', 'string', Rule::in(['draft', 'active', 'upcoming', 'completed'])],
            'template_id' => ['nullable', 'integer', 'exists:evaluation_templates,id'],
            'template_ids' => ['nullable', 'array'],
            'template_ids.*.template_id'     => ['required_with:template_ids', 'integer', 'exists:evaluation_templates,id'],
            'template_ids.*.evaluation_type' => ['required_with:template_ids', 'string', Rule::in(['self', 'peer', 'manager'])],
            'template_ids.*.department_id'   => ['nullable', 'integer', 'exists:departments,id'],
        ]);

        $startDate = \Carbon\Carbon::parse($data['start_date'] ?? $data['startDate']);
        $status = $data['status'] ?? 'active';

        if ($startDate->isFuture()) {
            $status = 'upcoming';
        }

        $companyId = $data['company_id'] ?? Company::query()->orderBy('id')->value('id');

        if ($status === 'active') {
            $existing = $this->findActivePeriod((int) $companyId);
            if ($existing) {
                return response()->json([
                    'message' => "Another evaluation period is already active: \"{$existing->name}\". Mark it completed before starting a new one, or set this period's start date to a future date.",
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        $period = DB::transaction(function () use ($data, $status, $companyId) {
            $period = EvaluationPeriod::create([
                'company_id'  => $companyId,
                'name'        => $data['name'],
                'start_date'  => $data['start_date'] ?? $data['startDate'],
                'end_date'    => $data['end_date'] ?? $data['endDate'],
                'status'      => $status,
                'template_id' => $data['template_id'] ?? null,
            ]);

            if (! empty($data['template_ids'])) {
                $this->syncTemplates($period, $data['template_ids']);
            }

            return $period;
        });

        $warnings = [];
        if ($period->status === 'active') {
            $warnings = $autoAssigner->assignFor($period);
        }

        $period->load(['templates.department'])->loadCount(['assignments', 'evaluations']);
        $payload = $this->periodPayload($period);
        $payload['selfWarnings'] = $warnings;

        return response()->json($payload, Response::HTTP_CREATED);
    }

    public function updatePeriod(Request $request, EvaluationPeriod $period): JsonResponse
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:150'],
            'start_date'  => ['required', 'date'],
            'startDate'   => ['sometimes', 'date'],
            'end_date'    => ['required_without:endDate', 'date', 'after:start_date'],
            'endDate'     => ['sometimes', 'date'],
            'template_ids' => ['nullable', 'array'],
            'template_ids.*.template_id'     => ['required_with:template_ids', 'integer', 'exists:evaluation_templates,id'],
            'template_ids.*.evaluation_type' => ['required_with:template_ids', 'string', Rule::in(['self', 'peer', 'manager'])],
            'template_ids.*.department_id'   => ['nullable', 'integer', 'exists:departments,id'],
        ]);

        $startDate = \Carbon\Carbon::parse($data['start_date'] ?? $data['startDate']);
        $status = $period->status;

        if ($startDate->isFuture() && $status === 'active') {
            $status = 'upcoming';
        }

        $period = DB::transaction(function () use ($data, $period, $status) {
            $period->update([
                'name'        => $data['name'],
                'start_date'  => $data['start_date'] ?? $data['startDate'],
                'end_date'    => $data['end_date'] ?? $data['endDate'],
                'status'      => $status,
            ]);

            if (isset($data['template_ids'])) {
                $this->syncTemplates($period, $data['template_ids']);
            }

            return $period;
        });

        $period->load(['templates.department'])->loadCount(['assignments', 'evaluations']);
        $payload = $this->periodPayload($period);

        return response()->json($payload);
    }

    public function activatePeriod(EvaluationPeriod $period, SelfEvaluationAutoAssigner $autoAssigner): JsonResponse
    {
        $wasActive = $period->status === 'active';

        if (! $wasActive) {
            $existing = $this->findActivePeriod((int) $period->company_id, $period->id);
            if ($existing) {
                return response()->json([
                    'message' => "Another evaluation period is already active: \"{$existing->name}\". Mark it completed before activating this one.",
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        $period->update(['status' => 'active']);
        $warnings = $autoAssigner->assignFor($period);

        if (! $wasActive) {
            event(new EvaluationPeriodActivated($period->fresh()));
        }

        $period->load(['templates.department'])->loadCount(['assignments', 'evaluations']);
        $payload = $this->periodPayload($period);
        $payload['selfWarnings'] = $warnings;

        return response()->json($payload);
    }

    private function findActivePeriod(int $companyId, ?int $excludePeriodId = null): ?EvaluationPeriod
    {
        $query = EvaluationPeriod::where('company_id', $companyId)
            ->where('status', 'active');

        if ($excludePeriodId !== null) {
            $query->where('id', '!=', $excludePeriodId);
        }

        return $query->first();
    }

    /**
     * Attach templates to a period via the pivot table. Replaces any existing pivot rows.
     *
     * @param array<int, array{template_id:int, evaluation_type:string, department_id?:int|null}> $templateRows
     */
    private function syncTemplates(EvaluationPeriod $period, array $templateRows): void
    {
        $sync = [];
        foreach ($templateRows as $row) {
            $sync[(int) $row['template_id']] = [
                'evaluation_type' => $row['evaluation_type'],
                'department_id'   => $row['department_id'] ?? null,
            ];
        }
        $period->templates()->sync($sync);
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

    /**
     * Legacy endpoint kept as an alias. Routes both /assign-peers and
     * /upsert-for-employee here. New callers should use the explicit
     * peers/manager structure; legacy callers passing `peer_ids` still work.
     */
    public function upsertEvaluatorsForEmployee(Request $request): JsonResponse
    {
        $assigner = $request->user('api') ?? $request->user();

        $data = $request->validate([
            'evaluation_period_id' => ['required', 'integer', 'exists:evaluation_periods,id'],
            'employee_id'          => ['required', 'integer', 'exists:employees,id'],

            // New shape
            'peers'                => ['sometimes', 'array', 'max:8'],
            'peers.*.evaluator_id' => ['required_with:peers', 'integer', 'exists:employees,id', 'different:employee_id'],
            'peers.*.template_id'  => ['nullable', 'integer', 'exists:evaluation_templates,id'],
            'manager'              => ['sometimes', 'nullable', 'array'],
            'manager.evaluator_id' => ['required_with:manager', 'integer', 'exists:employees,id'],
            'manager.template_id'  => ['nullable', 'integer', 'exists:evaluation_templates,id'],

            // Legacy shape (kept for backward compat with /assign-peers callers)
            'peer_ids'             => ['sometimes', 'array', 'max:8'],
            'peer_ids.*'           => ['integer', 'exists:employees,id', 'different:employee_id'],
            'manager_id'           => ['sometimes', 'nullable', 'integer', 'exists:employees,id'],
        ]);

        $periodId   = (int) $data['evaluation_period_id'];
        $employeeId = (int) $data['employee_id'];

        $period = EvaluationPeriod::findOrFail($periodId);
        if ($period->status !== 'active') {
            return response()->json(['message' => 'Cannot assign evaluators to a period that is not active yet.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Normalise legacy → new
        $peers = $data['peers']
            ?? array_map(fn ($id) => ['evaluator_id' => (int) $id, 'template_id' => null], $data['peer_ids'] ?? []);

        $manager = $data['manager'] ?? null;
        if ($manager === null && ! empty($data['manager_id'])) {
            $manager = ['evaluator_id' => (int) $data['manager_id'], 'template_id' => null];
        }

        $created = DB::transaction(function () use ($periodId, $employeeId, $peers, $manager, $assigner) {
            // Wipe existing peer + manager assignments for this (period, employee). Self assignments
            // are managed by SelfEvaluationAutoAssigner and intentionally left alone.
            EvaluationAssignment::query()
                ->where('evaluation_period_id', $periodId)
                ->where('employee_id', $employeeId)
                ->whereIn('evaluator_type', ['peer', 'manager'])
                ->delete();

            $rows = collect();

            $seenPeerIds = [];
            foreach ($peers as $peer) {
                $evaluatorId = (int) $peer['evaluator_id'];
                if (in_array($evaluatorId, $seenPeerIds, true)) continue;
                $seenPeerIds[] = $evaluatorId;

                $rows->push($this->assignment(
                    $periodId, $employeeId, $evaluatorId, 'peer',
                    $assigner->id, $peer['template_id'] ?? null, 'peer'
                ));
            }

            if ($manager && ! empty($manager['evaluator_id'])) {
                $rows->push($this->assignment(
                    $periodId, $employeeId, (int) $manager['evaluator_id'], 'manager',
                    $assigner->id, $manager['template_id'] ?? null, 'manager'
                ));
            }

            return $rows;
        });

        if ($created->isNotEmpty()) {
            event(new EvaluatorsAssigned($created->all()));
        }

        return response()->json([
            'message' => 'Evaluators assigned.',
            'data' => $created->map(fn (EvaluationAssignment $assignment) => $this->assignmentPayload(
                $assignment->load(['period', 'employee.department', 'evaluator.department', 'evaluation', 'template'])
            )),
        ], Response::HTTP_CREATED);
    }

    /**
     * Returns the current peer + manager assignments for one employee in one period.
     * Used by the redesigned Assign Evaluators panel to populate its initial state.
     */
    public function assignmentsForEmployeeInPeriod(Request $request): JsonResponse
    {
        $data = $request->validate([
            'evaluation_period_id' => ['required', 'integer', 'exists:evaluation_periods,id'],
            'employee_id'          => ['required', 'integer', 'exists:employees,id'],
        ]);

        $rows = EvaluationAssignment::query()
            ->with(['evaluator.department', 'template'])
            ->where('evaluation_period_id', $data['evaluation_period_id'])
            ->where('employee_id', $data['employee_id'])
            ->get();

        return response()->json([
            'data' => $rows->map(fn (EvaluationAssignment $a) => $this->assignmentPayload($a)),
        ]);
    }

    /**
     * Fetch the template questions for a given assignment.
     * Used by employees to load dynamic questions in the evaluation form.
     */
    public function questionsForAssignment(Request $request, EvaluationAssignment $assignment): JsonResponse
    {
        $employee = $request->user('api') ?? $request->user();

        // Only the assigned evaluator or admins can fetch the questions
        if ($assignment->evaluator_id !== $employee->id && ! $employee->hasPermission('performance_create')) {
            abort(Response::HTTP_FORBIDDEN, 'Not allowed to view this assignment.');
        }

        // Prefer the template attached directly to the assignment; fall back to
        // the period's legacy single template. Then verify the template's
        // evaluation_type matches what this assignment is for.
        $evaluationType = $assignment->evaluator_type; // self, peer, manager
        $template       = $assignment->template ?? $assignment->period?->template;

        if (! $template || $template->evaluation_type !== $evaluationType) {
            // No matching template — return empty so frontend falls back to hardcoded questions
            return response()->json(['data' => [], 'template' => null]);
        }

        $questions = $template->questions()
            ->with('options')
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'template' => [
                'id'             => $template->id,
                'title'           => $template->title,
                'evaluationType' => $template->evaluation_type,
                'weights'        => $template->weights,
            ],
            'data' => $questions->map(fn (EvaluationQuestion $q) => [
                'id'       => $q->id,
                'text'     => $q->text,
                'type'     => $q->type,
                'category' => $q->category,
                'required' => $q->required,
                'weight'   => $q->weight,
                'options'  => $q->options->map(fn ($o) => [
                    'id'    => $o->id,
                    'label' => $o->label,
                    'value' => $o->value,
                ]),
            ]),
        ]);
    }

    public function submitEvaluation(Request $request, EvaluationAssignment $assignment, EvaluationScoreService $scoreService): JsonResponse
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
            'answers.*.question_id' => ['required_with:answers.*', 'integer'],
            'answers.*.rating' => ['sometimes', 'nullable', 'numeric'],
            'answers.*.text_answer' => ['sometimes', 'nullable', 'string'],
            'answers.*.text' => ['sometimes', 'nullable', 'string'],
            'answers.*.selected_options' => ['sometimes', 'nullable', 'array'],
            'answers.*.selected_options.*' => ['integer'],
        ]);

        $answers = $data['answers'] ?? [];

        // Load the questions that belong to this assignment's template (with
        // options) so the scoring engine has both weights and option values.
        $questions = $assignment->template_id
            ? EvaluationQuestion::with('options')->where('template_id', $assignment->template_id)->get()
            : collect();

        $serviceScore = $scoreService->calculate($answers, $questions);

        $score = $data['score']
            ?? $data['rating']
            ?? $serviceScore;

        if ($score === null) {
            return response()->json(['message' => 'Score or rating answers are required.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $evaluation = PerformanceEvaluation::updateOrCreate(
            ['assignment_id' => $assignment->id],
            [
                'evaluator_id' => $assignment->evaluator_id,
                'employee_id' => $assignment->employee_id,
                'evaluation_period_id' => $assignment->evaluation_period_id,
                // Score is a snapshot — frozen at submission time. Future edits
                // to question weights or option values do not change historical
                // results because we persist the computed number here.
                'score' => $score,
                'comments' => $data['comments'] ?? json_encode($answers),
                'submitted_at' => now(),
                'status' => 'submitted',
            ]
        );

        // Persist individual answers when question_id is provided
        if (! empty($answers)) {
            foreach ($answers as $ans) {
                if (! empty($ans['question_id'])) {
                    EvaluationAnswer::updateOrCreate(
                        [
                            'evaluation_id' => $evaluation->id,
                            'question_id'   => $ans['question_id'],
                        ],
                        [
                            'rating'           => $ans['rating'] ?? null,
                            'text_answer'      => $ans['text_answer'] ?? $ans['text'] ?? null,
                            'selected_options' => $ans['selected_options'] ?? null,
                        ]
                    );
                }
            }
        }

        $this->recalculateSummary($assignment->employee_id, $assignment->evaluation_period_id);

        event(new EvaluationSubmitted($evaluation->fresh()));

        return response()->json($this->evaluationPayload($evaluation->load(['assignment', 'employee.department', 'evaluator'])), Response::HTTP_CREATED);
    }

    public function results(Request $request): JsonResponse
    {
        $period = null;

        if ($request->filled('evaluation_period_id')) {
            $period = EvaluationPeriod::with(['template', 'templates'])
                ->find($request->integer('evaluation_period_id'));
        }

        if (! $period) {
            $period = EvaluationPeriod::with(['template', 'templates'])
                ->where('status', 'active')
                ->latest('start_date')
                ->first();
        }

        if (! $period) {
            return response()->json(['data' => [], 'period' => null]);
        }

        $employeeIds = EvaluationAssignment::where('evaluation_period_id', $period->id)
            ->distinct()
            ->pluck('employee_id');

        if ($employeeIds->isEmpty()) {
            return response()->json([
                'data' => [],
                'period' => [
                    'id'        => $period->id,
                    'name'      => $period->name,
                    'status'    => $period->status,
                    'startDate' => $period->start_date?->toDateString(),
                    'endDate'   => $period->end_date?->toDateString(),
                ],
            ]);
        }

        $employees = Employee::whereIn('id', $employeeIds)
            ->with('department')
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get();

        $evaluations = PerformanceEvaluation::where('evaluation_period_id', $period->id)
            ->whereIn('employee_id', $employeeIds)
            ->where('status', 'submitted')
            ->with('assignment')
            ->get()
            ->groupBy('employee_id');

        $rows = $employees->map(function (Employee $employee) use ($evaluations, $period) {
            $employeeEvals = $evaluations->get($employee->id, collect());

            $scoreFor = function (string $type) use ($employeeEvals) {
                $matches = $employeeEvals->filter(fn (PerformanceEvaluation $e) => $e->assignment?->evaluator_type === $type);
                return $matches->isNotEmpty() ? round((float) $matches->avg('score'), 2) : null;
            };

            $self    = $scoreFor('self');
            $peer    = $scoreFor('peer');
            $manager = $scoreFor('manager');

            $hasAll = $self !== null && $peer !== null && $manager !== null;
            $hasAny = $self !== null || $peer !== null || $manager !== null;

            $finalScore = null;
            if ($hasAll) {
                $weights = $this->weightsForEmployee($period, $employee);
                $totalWeight = $weights['self'] + $weights['peer'] + $weights['manager'];
                if ($totalWeight > 0) {
                    $finalScore = round(
                        ($self * $weights['self'] + $peer * $weights['peer'] + $manager * $weights['manager']) / $totalWeight,
                        2
                    );
                }
            }

            $status = $hasAll ? 'completed' : ($hasAny ? 'in-progress' : 'pending');

            return [
                'id'           => $employee->id,
                'employee_id'  => $employee->id,
                'employeeName' => trim("{$employee->first_name} {$employee->last_name}"),
                'department'   => $employee->department?->name,
                'position'     => $employee->position,
                'period'       => $period->name,
                'selfScore'    => $self === null ? 0 : (float) $self,
                'peerScore'    => $peer === null ? 0 : (float) $peer,
                'managerScore' => $manager === null ? 0 : (float) $manager,
                'finalScore'   => $finalScore === null ? 0 : (float) $finalScore,
                'status'       => $status,
            ];
        });

        return response()->json([
            'data'   => $rows->values()->all(),
            'period' => [
                'id'        => $period->id,
                'name'      => $period->name,
                'status'    => $period->status,
                'startDate' => $period->start_date?->toDateString(),
                'endDate'   => $period->end_date?->toDateString(),
            ],
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
                ->map(function (PerformanceSummary $summary) {
                    $payload = $this->summaryPayload($summary);
                    
                    // Fetch evaluations for feedback
                    $evaluations = PerformanceEvaluation::query()
                        ->where('employee_id', $summary->employee_id)
                        ->where('evaluation_period_id', $summary->evaluation_period_id)
                        ->whereNotNull('comments')
                        ->with('assignment')
                        ->get();
                        
                    $feedback = [];
                    foreach ($evaluations as $eval) {
                        $type = $eval->assignment?->evaluator_type;
                        if ($type && $eval->comments) {
                            $from = match ($type) {
                                'self' => 'Self Evaluation',
                                'manager' => 'Manager Feedback',
                                'peer' => 'Peer Feedback',
                                default => 'Feedback'
                            };
                            $feedback[] = [
                                'from' => $from,
                                'type' => $type,
                                'comment' => $eval->comments,
                            ];
                        }
                    }
                    
                    $payload['feedback'] = $feedback;
                    return $payload;
                }),
        ]);
    }

    private function assignment(
        int $periodId,
        int $employeeId,
        int $evaluatorId,
        string $type,
        ?int $assignedBy,
        ?int $templateId = null,
        ?string $role = null
    ): EvaluationAssignment {
        return EvaluationAssignment::updateOrCreate(
            [
                'evaluation_period_id' => $periodId,
                'employee_id'          => $employeeId,
                'evaluator_id'         => $evaluatorId,
                'evaluator_type'       => $type,
            ],
            [
                'template_id'    => $templateId,
                'evaluator_role' => $role,
                'assigned_by'    => $assignedBy,
                'assigned_at'    => now(),
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

        $self    = $scoreFor('self');
        $peer    = $scoreFor('peer');
        $manager = $scoreFor('manager');

        // ── Weighted final score, resolved from the period's self-template (or fallback) ──
        $period = EvaluationPeriod::with(['template', 'templates'])->find($periodId);
        $employee = Employee::find($employeeId);
        $weights = $period ? $this->weightsForEmployee($period, $employee) : null;

        $finalScore = null;

        if ($weights && isset($weights['self'], $weights['peer'], $weights['manager'])) {
            // Only include types that have at least one submitted evaluation
            $weightedSum   = 0.0;
            $allocatedWeight = 0;

            foreach (['self' => $self, 'peer' => $peer, 'manager' => $manager] as $type => $score) {
                if ($score !== null) {
                    $weightedSum     += $score * $weights[$type];
                    $allocatedWeight += $weights[$type];
                }
            }

            if ($allocatedWeight > 0) {
                $finalScore = round($weightedSum / $allocatedWeight, 2);
            }
        } else {
            // Fallback: simple average over available scores
            $available = collect([$self, $peer, $manager])->filter(fn ($s) => $s !== null);
            if ($available->count()) {
                $finalScore = round($available->avg(), 2);
            }
        }

        return PerformanceSummary::updateOrCreate(
            ['employee_id' => $employeeId, 'evaluation_period_id' => $periodId],
            [
                'self_score'    => $self,
                'peer_score'    => $peer,
                'manager_score' => $manager,
                'final_score'   => $finalScore,
                'calculated_at' => now(),
            ]
        );
    }

    /**
     * @deprecated Use EvaluationScoreService::calculate() — kept only as a
     * fallback callsite. Will be removed once all callers route through the
     * service.
     */
    private function scoreFromAnswers(array $answers): ?float
    {
        $ratings = collect($answers)->pluck('rating')->filter(fn ($rating) => is_numeric($rating));

        return $ratings->count() ? round($ratings->avg(), 2) : null;
    }

    /**
     * Resolve the weight split that drives the final score for one employee in one period.
     *  - prefer the period's attached self-template that matches the employee's department
     *  - else the period's first attached self-template
     *  - else the legacy period->template->weights
     *  - else {30, 30, 40}
     */
    private function weightsForEmployee(EvaluationPeriod $period, ?Employee $employee): array
    {
        $deptId = $employee?->department_id;
        $weights = null;

        if ($period->relationLoaded('templates') || $period->templates) {
            $selfTemplates = $period->templates->where('pivot.evaluation_type', 'self');

            if ($deptId) {
                $match = $selfTemplates->first(fn ($t) => (int) $t->pivot->department_id === (int) $deptId);
                if ($match) $weights = $match->weights;
            }

            if (! $weights) {
                $globalSelf = $selfTemplates->first(fn ($t) => $t->pivot->department_id === null);
                if ($globalSelf) $weights = $globalSelf->weights;
            }

            if (! $weights) {
                $first = $selfTemplates->first();
                if ($first) $weights = $first->weights;
            }
        }

        if (! $weights) {
            $weights = $period->template?->weights;
        }

        if (! $weights || ! isset($weights['self'], $weights['peer'], $weights['manager'])) {
            $weights = ['self' => 30, 'peer' => 30, 'manager' => 40];
        }

        return $weights;
    }

    private function periodPayload(EvaluationPeriod $period): array
    {
        $total     = $period->assignments_count ?? $period->assignments()->count();
        $completed = $period->evaluations_count ?? $period->evaluations()->count();

        $templates = [];
        if ($period->relationLoaded('templates')) {
            $templates = $period->templates->map(fn (EvaluationTemplate $t) => [
                'id'              => $t->id,
                'title'           => $t->title,
                'evaluationType'  => $t->pivot->evaluation_type ?? $t->evaluation_type,
                'departmentId'    => $t->pivot->department_id,
                'departmentName'  => $t->department?->name,
            ])->values()->all();
        }

        return [
            'id'             => $period->id,
            'title'          => $period->name,
            'name'           => $period->name,
            'startDate'      => $period->start_date?->toDateString(),
            'endDate'        => $period->end_date?->toDateString(),
            'status'         => $period->status,
            'completed'      => $completed,
            'totalEmployees' => $total,
            'progress'       => $total ? round(($completed / $total) * 100) : 0,
            'templates'      => $templates,
        ];
    }

    private function assignmentPayload(EvaluationAssignment $assignment): array
    {
        $template = null;
        if ($assignment->relationLoaded('template') && $assignment->template) {
            $template = [
                'id'    => $assignment->template->id,
                'title' => $assignment->template->title,
            ];
        } elseif ($assignment->template_id) {
            $template = ['id' => $assignment->template_id, 'title' => null];
        }

        return [
            'id'                   => $assignment->id,
            'evaluation_period_id' => $assignment->evaluation_period_id,
            'period'               => $assignment->period?->name,
            'employee_id'          => $assignment->employee_id,
            'employee'             => $this->employeePayload($assignment->employee),
            'evaluator_id'         => $assignment->evaluator_id,
            'evaluator'            => $this->employeePayload($assignment->evaluator),
            'type'                 => $assignment->evaluator_type,
            'evaluatorRole'        => $assignment->evaluator_role,
            'templateId'           => $assignment->template_id,
            'template'             => $template,
            'status'               => $assignment->evaluation ? $assignment->evaluation->status : 'pending',
            'score'                => $assignment->evaluation?->score === null ? null : (float) $assignment->evaluation->score,
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
