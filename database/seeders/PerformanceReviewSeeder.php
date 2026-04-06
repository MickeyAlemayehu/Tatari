<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\PerformanceReview;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class PerformanceReviewSeeder extends Seeder
{
    public function run(): void
    {
        $staff = Employee::where('email', 'staff@tatari.local')->first();
        $manager = Employee::where('email', 'manager@tatari.local')->first();

        if (! $staff || ! $manager) {
            return;
        }

        PerformanceReview::updateOrCreate(
            ['employee_id' => $staff->id, 'cycle' => '2026 H1'],
            [
                'reviewer_id' => $manager->id,
                'status' => 'in_review',
                'due_date' => Carbon::parse('2026-06-30'),
                'strengths' => 'Consistently meets deadlines; strong teamwork.',
                'areas_for_improvement' => 'Improve Excel modeling speed.',
                'goals_next_period' => 'Lead onboarding documentation refresh.',
                'submitted_at' => now()->subDays(7),
            ]
        );

        PerformanceReview::updateOrCreate(
            ['employee_id' => $manager->id, 'cycle' => '2025 Annual'],
            [
                'reviewer_id' => $staff->id, // peer review example
                'status' => 'completed',
                'rating' => 5,
                'due_date' => Carbon::parse('2026-01-31'),
                'completed_at' => now()->subMonths(2),
                'strengths' => 'Excellent leadership and conflict resolution.',
                'areas_for_improvement' => 'Delegate more, reduce meeting load.',
                'goals_next_period' => 'Roll out mentorship program.',
            ]
        );
    }
}
