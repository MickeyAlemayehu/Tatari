<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('evaluation_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('evaluation_templates')->cascadeOnDelete();
            $table->text('text');
            $table->string('type')->default('rating'); // rating, text, textarea, multiple_choice, checkbox, yes_no, numeric
            $table->string('evaluation_type')->default('self'); // self, peer, manager
            $table->string('category')->nullable();
            $table->boolean('required')->default(true);
            $table->integer('sort_order')->default(0);
            $table->integer('weight')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluation_questions');
    }
};
