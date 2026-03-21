<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('performance_summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('evaluation_period_id')->constrained()->cascadeOnDelete();
            $table->decimal('self_score', 5, 2)->nullable();
            $table->decimal('peer_score', 5, 2)->nullable();
            $table->decimal('manager_score', 5, 2)->nullable();
            $table->decimal('final_score', 5, 2)->nullable();
            $table->timestamp('calculated_at')->useCurrent();

            $table->unique(['employee_id', 'evaluation_period_id']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('performance_summaries');
    }
};