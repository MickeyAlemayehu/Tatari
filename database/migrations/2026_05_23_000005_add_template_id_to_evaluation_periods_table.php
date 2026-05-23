<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('evaluation_periods', function (Blueprint $table) {
            if (! Schema::hasColumn('evaluation_periods', 'template_id')) {
                $table->foreignId('template_id')->nullable()->after('company_id')
                    ->constrained('evaluation_templates')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('evaluation_periods', function (Blueprint $table) {
            if (Schema::hasColumn('evaluation_periods', 'template_id')) {
                $table->dropConstrainedForeignId('template_id');
            }
        });
    }
};
