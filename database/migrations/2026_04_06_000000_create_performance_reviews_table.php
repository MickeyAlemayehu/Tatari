<?php

use App\Models\Employee;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('performance_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Employee::class, 'employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignIdFor(Employee::class, 'reviewer_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->string('cycle')->default('Annual'); // e.g., "2026 H1", "Q2", "Annual"
            $table->string('status')->default('draft'); // draft, submitted, in_review, completed
            $table->unsignedTinyInteger('rating')->nullable(); // 1–5 scale
            $table->text('strengths')->nullable();
            $table->text('areas_for_improvement')->nullable();
            $table->text('goals_next_period')->nullable();
            $table->date('due_date')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('performance_reviews');
    }
};
