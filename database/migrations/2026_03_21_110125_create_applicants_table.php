<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('applicants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vacancy_id')->constrained('job_vacancies')->cascadeOnDelete();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email');
            $table->string('phone');
            $table->string('resume_path')->nullable();
            $table->text('cover_letter')->nullable();
            $table->string('status')->default('submitted');
            $table->timestamp('applied_at')->useCurrent();
            $table->foreignId('reviewed_by')->nullable()->constrained('employees')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('rejection_reason')->nullable();
        });
    }

    public function down(): void {
        Schema::dropIfExists('applicants');
    }
};