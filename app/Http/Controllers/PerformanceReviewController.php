<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\PerformanceReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class PerformanceReviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user('api') ?? $request->user();
        $isManager = $user->hasPermission('manage_performance_reviews');

        $query = PerformanceReview::query()
            ->with(['employee', 'reviewer'])
            ->when(! $isManager, function ($q) use ($user) {
                $q->where('employee_id', $user->id);
            }, function ($q) use ($user) {
                $q->where(function ($inner) use ($user) {
                    $inner->where('employee_id', $user->id)
                        ->orWhere('reviewer_id', $user->id);
                });
            })
            ->latest();

        return response()->json($query->paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user('api') ?? $request->user();

        $data = $request->validate([
            'employee_id' => ['required', 'exists:employees,id'],
            'cycle' => ['required', 'string', 'max:100'],
            'due_date' => ['nullable', 'date'],
            'strengths' => ['nullable', 'string'],
            'areas_for_improvement' => ['nullable', 'string'],
            'goals_next_period' => ['nullable', 'string'],
            'rating' => ['nullable', 'integer', 'between:1,5'],
        ]);

        if (! $user->hasPermission('manage_performance_reviews') && (int) $data['employee_id'] !== $user->id) {
            abort(Response::HTTP_FORBIDDEN, 'Cannot create reviews for other employees.');
        }

        $review = PerformanceReview::create([
            ...$data,
            'reviewer_id' => $user->id,
            'status' => 'draft',
        ]);

        return response()->json($review->load(['employee', 'reviewer']), Response::HTTP_CREATED);
    }

    public function show(PerformanceReview $performanceReview): JsonResponse
    {
        $this->authorizeView($performanceReview);

        return response()->json($performanceReview->load(['employee', 'reviewer']));
    }

    public function update(Request $request, PerformanceReview $performanceReview): JsonResponse
    {
        $this->authorizeEdit($request->user('api') ?? $request->user(), $performanceReview);

        $data = $request->validate([
            'cycle' => ['sometimes', 'string', 'max:100'],
            'due_date' => ['nullable', 'date'],
            'strengths' => ['nullable', 'string'],
            'areas_for_improvement' => ['nullable', 'string'],
            'goals_next_period' => ['nullable', 'string'],
            'rating' => ['nullable', 'integer', 'between:1,5'],
            'status' => ['sometimes', 'in:draft,submitted,in_review,completed'],
        ]);

        $performanceReview->update($data);

        return response()->json($performanceReview->load(['employee', 'reviewer']));
    }

    public function submit(Request $request, PerformanceReview $performanceReview): JsonResponse
    {
        $this->authorizeEdit($request->user('api') ?? $request->user(), $performanceReview);

        $performanceReview->update([
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        return response()->json($performanceReview->fresh()->load(['employee', 'reviewer']));
    }

    public function complete(Request $request, PerformanceReview $performanceReview): JsonResponse
    {
        $user = $request->user('api') ?? $request->user();
        if ($performanceReview->reviewer_id !== $user->id && ! $user->hasPermission('manage_performance_reviews')) {
            abort(Response::HTTP_FORBIDDEN, 'Only reviewers or managers can complete reviews.');
        }

        $data = $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
            'strengths' => ['nullable', 'string'],
            'areas_for_improvement' => ['nullable', 'string'],
            'goals_next_period' => ['nullable', 'string'],
        ]);

        $performanceReview->update([
            ...$data,
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        return response()->json($performanceReview->fresh()->load(['employee', 'reviewer']));
    }

    protected function authorizeView(PerformanceReview $review): void
    {
        $user = Auth::guard('api')->user() ?? Auth::user();

        $canView = $review->employee_id === $user->id
            || $review->reviewer_id === $user->id
            || $user->hasPermission('manage_performance_reviews');

        if (! $canView) {
            abort(Response::HTTP_FORBIDDEN, 'Not allowed to view this review.');
        }
    }

    protected function authorizeEdit(Employee $user, PerformanceReview $review): void
    {
        $canEdit = $review->reviewer_id === $user->id
            || $review->employee_id === $user->id
            || $user->hasPermission('manage_performance_reviews');

        if (! $canEdit) {
            abort(Response::HTTP_FORBIDDEN, 'Not allowed to edit this review.');
        }
    }
}
