<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('evaluation_templates', function (Blueprint $table) {
            $table->string('evaluation_type', 16)->default('self')->after('status');
            $table->foreignId('department_id')
                ->nullable()
                ->after('evaluation_type')
                ->constrained('departments')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('evaluation_templates', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropColumn(['evaluation_type', 'department_id']);
        });
    }
};
