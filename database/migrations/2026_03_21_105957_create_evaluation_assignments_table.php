<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('evaluation_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluation_period_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('evaluator_id')->constrained('employees')->cascadeOnDelete();
            $table->string('evaluator_type'); // self, peer, manager
            $table->foreignId('assigned_by')->nullable()->constrained('employees')->nullOnDelete();
            $table->timestamp('assigned_at')->useCurrent();
        });
    }

    public function down(): void {
        Schema::dropIfExists('evaluation_assignments');
    }
};