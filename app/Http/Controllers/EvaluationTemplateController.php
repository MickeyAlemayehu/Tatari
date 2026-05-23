<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\EvaluationQuestion;
use App\Models\EvaluationQuestionOption;
use App\Models\EvaluationTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class EvaluationTemplateController extends Controller
{
    // ──────────────────────────────────────────────
    // Template CRUD
    // ──────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $query = EvaluationTemplate::query()
            ->withCount('questions')
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json([
            'data' => $query->get()->map(fn (EvaluationTemplate $t) => $this->templatePayload($t)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'       => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:1000'],
            'status'      => ['sometimes', 'string', Rule::in(['draft', 'active', 'inactive'])],
            'weights'     => ['nullable', 'array'],
            'weights.self'    => ['sometimes', 'integer', 'min:0', 'max:100'],
            'weights.peer'    => ['sometimes', 'integer', 'min:0', 'max:100'],
            'weights.manager' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'company_id'  => ['nullable', 'integer', 'exists:companies,id'],
            // Inline questions when creating a template
            'questions'   => ['sometimes', 'array'],
            'questions.*.text'            => ['required', 'string', 'max:1000'],
            'questions.*.type'            => ['sometimes', 'string', Rule::in(['rating', 'text', 'textarea', 'multiple_choice', 'checkbox', 'yes_no', 'numeric'])],
            'questions.*.evaluation_type' => ['sometimes', 'string', Rule::in(['self', 'peer', 'manager'])],
            'questions.*.evaluationType'  => ['sometimes', 'string', Rule::in(['self', 'peer', 'manager'])],
            'questions.*.category'        => ['nullable', 'string', 'max:150'],
            'questions.*.required'        => ['sometimes', 'boolean'],
            'questions.*.weight'          => ['sometimes', 'integer', 'min:0'],
            'questions.*.options'         => ['sometimes', 'array'],
            'questions.*.options.*.label' => ['required_with:questions.*.options', 'string'],
            'questions.*.options.*.value' => ['sometimes', 'integer'],
        ]);

        $this->assertWeightsSumTo100($data['weights'] ?? null);

        $template = EvaluationTemplate::create([
            'company_id'  => $data['company_id'] ?? Company::query()->orderBy('id')->value('id'),
            'title'       => $data['title'],
            'description' => $data['description'] ?? null,
            'status'      => $data['status'] ?? 'draft',
            'weights'     => $data['weights'] ?? ['self' => 30, 'peer' => 30, 'manager' => 40],
        ]);

        // Bulk-create questions if provided inline
        if (! empty($data['questions'])) {
            foreach ($data['questions'] as $i => $qData) {
                $question = $template->questions()->create([
                    'text'            => $qData['text'],
                    'type'            => $qData['type'] ?? 'rating',
                    'evaluation_type' => $qData['evaluation_type'] ?? $qData['evaluationType'] ?? 'self',
                    'category'        => $qData['category'] ?? null,
                    'required'        => $qData['required'] ?? true,
                    'sort_order'      => $i,
                    'weight'          => $qData['weight'] ?? 1,
                ]);

                if (! empty($qData['options'])) {
                    foreach ($qData['options'] as $j => $opt) {
                        $question->options()->create([
                            'label'      => $opt['label'],
                            'value'      => $opt['value'] ?? 0,
                            'sort_order' => $j,
                        ]);
                    }
                }
            }
        }

        return response()->json(
            $this->templatePayload($template->loadCount('questions')->load('questions.options')),
            Response::HTTP_CREATED
        );
    }

    public function show(EvaluationTemplate $template): JsonResponse
    {
        $template->loadCount('questions')->load('questions.options');

        return response()->json($this->templatePayload($template, true));
    }

    public function update(Request $request, EvaluationTemplate $template): JsonResponse
    {
        $data = $request->validate([
            'title'       => ['sometimes', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:1000'],
            'status'      => ['sometimes', 'string', Rule::in(['draft', 'active', 'inactive'])],
            'weights'     => ['nullable', 'array'],
            'weights.self'    => ['sometimes', 'integer', 'min:0', 'max:100'],
            'weights.peer'    => ['sometimes', 'integer', 'min:0', 'max:100'],
            'weights.manager' => ['sometimes', 'integer', 'min:0', 'max:100'],
        ]);

        $this->assertWeightsSumTo100($data['weights'] ?? null);

        $template->update($data);

        return response()->json($this->templatePayload($template->loadCount('questions')));
    }

    public function destroy(EvaluationTemplate $template): JsonResponse
    {
        $template->delete();

        return response()->json(['message' => 'Template deleted.'], Response::HTTP_OK);
    }

    public function activate(EvaluationTemplate $template): JsonResponse
    {
        $template->update(['status' => 'active']);

        return response()->json($this->templatePayload($template->loadCount('questions')));
    }

    public function deactivate(EvaluationTemplate $template): JsonResponse
    {
        $template->update(['status' => 'inactive']);

        return response()->json($this->templatePayload($template->loadCount('questions')));
    }

    // ──────────────────────────────────────────────
    // Question CRUD (nested under template)
    // ──────────────────────────────────────────────

    public function questions(Request $request): JsonResponse
    {
        $query = EvaluationQuestion::query()->with('options')->orderBy('sort_order');

        if ($request->filled('template_id')) {
            $query->where('template_id', $request->integer('template_id'));
        }

        if ($request->filled('evaluation_type') || $request->filled('evaluationType')) {
            $type = $request->string('evaluation_type') ?: $request->string('evaluationType');
            $query->where('evaluation_type', (string) $type);
        }

        return response()->json([
            'data' => $query->get()->map(fn (EvaluationQuestion $q) => $this->questionPayload($q)),
        ]);
    }

    public function storeQuestion(Request $request): JsonResponse
    {
        // Accept both `evaluation_type` (snake_case, DB/PHP) and `evaluationType` (camelCase,
        // frontend). The controller bridges the two conventions so the frontend doesn't need
        // a separate adapter layer; on write we normalize to `evaluation_type` for storage.
        $data = $request->validate([
            'template_id'     => ['required', 'integer', 'exists:evaluation_templates,id'],
            'text'            => ['required', 'string', 'max:1000'],
            'type'            => ['sometimes', 'string', Rule::in(['rating', 'text', 'textarea', 'multiple_choice', 'checkbox', 'yes_no', 'numeric'])],
            'evaluation_type' => ['sometimes', 'string', Rule::in(['self', 'peer', 'manager'])],
            'evaluationType'  => ['sometimes', 'string', Rule::in(['self', 'peer', 'manager'])],
            'category'        => ['nullable', 'string', 'max:150'],
            'required'        => ['sometimes', 'boolean'],
            'sort_order'      => ['sometimes', 'integer', 'min:0'],
            'weight'          => ['sometimes', 'integer', 'min:0'],
            'options'         => ['sometimes', 'array'],
            'options.*.label' => ['required_with:options', 'string'],
            'options.*.value' => ['sometimes', 'integer'],
        ]);

        // Default sort_order to end of list
        $maxOrder = EvaluationQuestion::where('template_id', $data['template_id'])->max('sort_order') ?? -1;

        $question = EvaluationQuestion::create([
            'template_id'     => $data['template_id'],
            'text'            => $data['text'],
            'type'            => $data['type'] ?? 'rating',
            'evaluation_type' => $data['evaluation_type'] ?? $data['evaluationType'] ?? 'self',
            'category'        => $data['category'] ?? null,
            'required'        => $data['required'] ?? true,
            'sort_order'      => $data['sort_order'] ?? $maxOrder + 1,
            'weight'          => $data['weight'] ?? 1,
        ]);

        // Create options if provided
        if (! empty($data['options'])) {
            foreach ($data['options'] as $j => $opt) {
                $question->options()->create([
                    'label'      => $opt['label'],
                    'value'      => $opt['value'] ?? 0,
                    'sort_order' => $j,
                ]);
            }
        }

        return response()->json(
            $this->questionPayload($question->load('options')),
            Response::HTTP_CREATED
        );
    }

    public function showQuestion(EvaluationQuestion $question): JsonResponse
    {
        $question->load('options');

        return response()->json($this->questionPayload($question));
    }

    public function updateQuestion(Request $request, EvaluationQuestion $question): JsonResponse
    {
        $data = $request->validate([
            'text'            => ['sometimes', 'string', 'max:1000'],
            'type'            => ['sometimes', 'string', Rule::in(['rating', 'text', 'textarea', 'multiple_choice', 'checkbox', 'yes_no', 'numeric'])],
            'evaluation_type' => ['sometimes', 'string', Rule::in(['self', 'peer', 'manager'])],
            'evaluationType'  => ['sometimes', 'string', Rule::in(['self', 'peer', 'manager'])],
            'category'        => ['nullable', 'string', 'max:150'],
            'required'        => ['sometimes', 'boolean'],
            'sort_order'      => ['sometimes', 'integer', 'min:0'],
            'weight'          => ['sometimes', 'integer', 'min:0'],
            'options'         => ['sometimes', 'array'],
            'options.*.label' => ['required_with:options', 'string'],
            'options.*.value' => ['sometimes', 'integer'],
        ]);

        // Normalise camelCase field from frontend
        if (isset($data['evaluationType']) && ! isset($data['evaluation_type'])) {
            $data['evaluation_type'] = $data['evaluationType'];
        }
        unset($data['evaluationType']);

        // Pull options out before model update
        $options = $data['options'] ?? null;
        unset($data['options']);

        $question->update($data);

        // Replace options if provided
        if ($options !== null) {
            $question->options()->delete();
            foreach ($options as $j => $opt) {
                $question->options()->create([
                    'label'      => $opt['label'],
                    'value'      => $opt['value'] ?? 0,
                    'sort_order' => $j,
                ]);
            }
        }

        return response()->json($this->questionPayload($question->load('options')));
    }

    public function destroyQuestion(EvaluationQuestion $question): JsonResponse
    {
        $question->delete();

        return response()->json(['message' => 'Question deleted.'], Response::HTTP_OK);
    }

    public function reorderQuestions(Request $request): JsonResponse
    {
        $data = $request->validate([
            'questions'            => ['required', 'array', 'min:1'],
            'questions.*.id'       => ['required', 'integer', 'exists:evaluation_questions,id'],
            'questions.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($data['questions'] as $item) {
            EvaluationQuestion::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json(['message' => 'Questions reordered.']);
    }

    // ──────────────────────────────────────────────
    // Payload helpers
    // ──────────────────────────────────────────────

    private function assertWeightsSumTo100(?array $weights): void
    {
        if ($weights === null) {
            return;
        }

        $sum = (int) ($weights['self'] ?? 0)
             + (int) ($weights['peer'] ?? 0)
             + (int) ($weights['manager'] ?? 0);

        if ($sum !== 100) {
            throw ValidationException::withMessages([
                'weights' => 'The self, peer, and manager weights must sum to 100.',
            ]);
        }
    }

    private function templatePayload(EvaluationTemplate $t, bool $includeQuestions = false): array
    {
        $payload = [
            'id'          => $t->id,
            'title'       => $t->title,
            'description' => $t->description,
            'status'      => $t->status,
            'weights'     => $t->weights ?? ['self' => 30, 'peer' => 30, 'manager' => 40],
            'questionCount' => $t->questions_count ?? $t->questions()->count(),
            'createdAt'   => $t->created_at?->toISOString(),
            'updatedAt'   => $t->updated_at?->toISOString(),
        ];

        if ($includeQuestions && $t->relationLoaded('questions')) {
            $payload['questions'] = $t->questions->map(fn (EvaluationQuestion $q) => $this->questionPayload($q))->values();
        }

        return $payload;
    }

    private function questionPayload(EvaluationQuestion $q): array
    {
        $payload = [
            'id'             => $q->id,
            'template_id'    => $q->template_id,
            'text'           => $q->text,
            'type'           => $q->type,
            'evaluationType' => $q->evaluation_type,
            'evaluation_type' => $q->evaluation_type,
            'category'       => $q->category,
            'required'       => $q->required,
            'sort_order'     => $q->sort_order,
            'weight'         => $q->weight,
        ];

        if ($q->relationLoaded('options') && $q->options->isNotEmpty()) {
            $payload['options'] = $q->options->map(fn (EvaluationQuestionOption $o) => [
                'id'    => $o->id,
                'label' => $o->label,
                'value' => $o->value,
            ])->values();
        }

        return $payload;
    }
}
