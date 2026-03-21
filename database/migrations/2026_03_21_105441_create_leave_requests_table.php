<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('leave_type_id')->constrained()->cascadeOnDelete();
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_half_day')->default(false);
            $table->text('reason')->nullable();
            $table->string('status')->default('pending');
            $table->timestamp('applied_at')->useCurrent();
            $table->foreignId('approved_by')->nullable()->constrained('employees')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();

            $table->index(['employee_id', 'leave_type_id']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('leave_requests');
    }
};