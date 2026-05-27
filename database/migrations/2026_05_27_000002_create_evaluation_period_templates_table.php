<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('evaluation_period_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluation_period_id')
                ->constrained('evaluation_periods')
                ->cascadeOnDelete();
            $table->foreignId('template_id')
                ->constrained('evaluation_templates')
                ->cascadeOnDelete();
            $table->string('evaluation_type', 16);
            $table->foreignId('department_id')
                ->nullable()
                ->constrained('departments')
                ->nullOnDelete();
            $table->timestamps();

            $table->unique(['evaluation_period_id', 'template_id'], 'eval_period_template_unique');
            $table->index(['evaluation_period_id', 'evaluation_type'], 'eval_period_type_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluation_period_templates');
    }
};
