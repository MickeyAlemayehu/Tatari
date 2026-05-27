<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasColumn('evaluation_questions', 'evaluation_type')) {
            Schema::table('evaluation_questions', function (Blueprint $table) {
                $table->dropColumn('evaluation_type');
            });
        }
    }

    public function down(): void
    {
        Schema::table('evaluation_questions', function (Blueprint $table) {
            $table->string('evaluation_type')->default('self')->after('type');
        });
    }
};
