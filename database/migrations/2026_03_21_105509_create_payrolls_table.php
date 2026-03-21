<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->integer('year');
            $table->tinyInteger('month');
            $table->decimal('basic_salary', 10, 2);
            $table->decimal('total_allowances', 10, 2)->default(0);
            $table->decimal('bonuses', 10, 2)->default(0);
            $table->decimal('deductions', 10, 2)->default(0);
            $table->integer('unpaid_leave_days')->default(0);
            $table->decimal('unpaid_leave_amount', 10, 2)->default(0);
            $table->string('status')->default('draft');
            $table->timestamp('generated_at')->useCurrent();
            $table->foreignId('approved_by')->nullable()->constrained('employees')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();

            $table->index(['employee_id', 'company_id']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('payrolls');
    }
};