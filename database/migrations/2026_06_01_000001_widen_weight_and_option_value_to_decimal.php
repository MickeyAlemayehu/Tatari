<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Widen question.weight and question_option.value from integer to decimal(8,2)
 * so the scoring engine can represent fractional weights (e.g. 1.5×) and
 * non-integer option values (e.g. a 1.25 step on a custom scale).
 *
 * Backfill policy: existing option values default to 0 from the original
 * schema, but per product decision we DO NOT auto-assign Likert values
 * here. Templates with un-backfilled options will simply contribute zero
 * to the scoring engine until an admin edits the option values in the
 * template editor. This avoids silently changing historical templates'
 * scoring behavior. The choice is documented here so future readers know
 * it is intentional, not an oversight.
 *
 * Existing integer values are widened in place — no data loss possible
 * (every int fits in decimal(8,2)).
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('evaluation_questions', function (Blueprint $table) {
            $table->decimal('weight', 8, 2)->default(1)->change();
        });

        Schema::table('evaluation_question_options', function (Blueprint $table) {
            $table->decimal('value', 8, 2)->default(0)->change();
        });
    }

    public function down(): void
    {
        Schema::table('evaluation_questions', function (Blueprint $table) {
            $table->integer('weight')->default(1)->change();
        });

        Schema::table('evaluation_question_options', function (Blueprint $table) {
            $table->integer('value')->default(0)->change();
        });
    }
};
