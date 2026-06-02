<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('applicant_recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('applicant_id')->unique()->constrained('applicants')->cascadeOnDelete();
            $table->foreignId('vacancy_id')->constrained('job_vacancies')->cascadeOnDelete();
            $table->string('status', 20)->default('pending');
            $table->decimal('score', 5, 2)->nullable();
            $table->string('verdict', 20)->nullable();
            $table->text('summary')->nullable();
            $table->json('strengths')->nullable();
            $table->json('gaps')->nullable();
            $table->text('cv_text_excerpt')->nullable();
            $table->unsignedInteger('cv_text_length')->nullable();
            $table->string('model_version')->nullable();
            $table->string('input_hash', 64)->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('notified_at')->nullable();
            $table->timestamps();

            $table->index(['vacancy_id', 'score']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applicant_recommendations');
    }
};
