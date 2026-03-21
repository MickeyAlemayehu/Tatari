<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('performance_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained('evaluation_assignments')->cascadeOnDelete();
            $table->foreignId('evaluator_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('evaluation_period_id')->constrained()->cascadeOnDelete();
            $table->decimal('score', 5, 2);
            $table->text('comments')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->string('status')->default('draft');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('performance_evaluations');
    }
};