<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('evaluation_assignments', function (Blueprint $table) {
            $table->foreignId('template_id')
                ->nullable()
                ->after('evaluator_type')
                ->constrained('evaluation_templates')
                ->nullOnDelete();
            $table->string('evaluator_role', 16)->nullable()->after('template_id');
            $table->index('evaluator_role', 'eval_assign_role_idx');
        });

        // Backfill evaluator_role from evaluator_type for existing rows
        DB::statement("UPDATE evaluation_assignments SET evaluator_role = evaluator_type WHERE evaluator_role IS NULL");
    }

    public function down(): void
    {
        Schema::table('evaluation_assignments', function (Blueprint $table) {
            $table->dropIndex('eval_assign_role_idx');
            $table->dropForeign(['template_id']);
            $table->dropColumn(['template_id', 'evaluator_role']);
        });
    }
};
