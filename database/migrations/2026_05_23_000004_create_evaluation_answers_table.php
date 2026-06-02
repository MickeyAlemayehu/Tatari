<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('evaluation_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluation_id')->constrained('performance_evaluations')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('evaluation_questions')->cascadeOnDelete();
            $table->decimal('rating', 5, 2)->nullable();
            $table->text('text_answer')->nullable();
            $table->json('selected_options')->nullable(); // for multi-select / checkbox
            $table->timestamps();

            $table->unique(['evaluation_id', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluation_answers');
    }
};
