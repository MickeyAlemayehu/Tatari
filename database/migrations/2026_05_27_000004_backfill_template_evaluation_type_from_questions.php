<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Backfill evaluation_templates.evaluation_type from the question rows below them
     * before the question column is dropped in the following migration.
     *
     *  - all questions agree on a type  → set template.evaluation_type to that
     *  - templates with mixed types     → set template.evaluation_type to 'peer'
     *                                     and emit a warning so the admin knows
     *                                     to revisit those templates
     *  - templates with zero questions  → leave whatever default the column has
     */
    public function up(): void
    {
        if (! Schema::hasTable('evaluation_questions') ||
            ! Schema::hasColumn('evaluation_questions', 'evaluation_type')) {
            return;
        }

        $rows = DB::table('evaluation_questions')
            ->select('template_id', 'evaluation_type')
            ->whereNotNull('template_id')
            ->get();

        $byTemplate = [];
        foreach ($rows as $row) {
            $tid = (int) $row->template_id;
            $byTemplate[$tid] ??= [];
            $byTemplate[$tid][$row->evaluation_type] = true;
        }

        $mixedTemplateIds = [];

        foreach ($byTemplate as $templateId => $typeSet) {
            $types = array_keys($typeSet);

            if (count($types) === 1) {
                DB::table('evaluation_templates')
                    ->where('id', $templateId)
                    ->update(['evaluation_type' => $types[0]]);
                continue;
            }

            $mixedTemplateIds[] = $templateId;
            DB::table('evaluation_templates')
                ->where('id', $templateId)
                ->update(['evaluation_type' => 'peer']);
        }

        if (! empty($mixedTemplateIds)) {
            Log::warning(
                'Backfill: evaluation templates had questions of mixed evaluation_type. Defaulted to "peer".',
                ['template_ids' => $mixedTemplateIds]
            );
        }
    }

    public function down(): void
    {
        // No-op. We cannot restore the old per-question types from the template-level value.
    }
};
