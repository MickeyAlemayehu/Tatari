<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table): void {
            if (! Schema::hasColumn('employees', 'permission_level')) {
                $table->tinyInteger('permission_level')->default(1);
            }

            if (! Schema::hasColumn('employees', 'custom_override')) {
                $table->json('custom_override')->nullable()->after('permission_override');
            }

            if (! Schema::hasColumn('employees', 'revoked_permissions')) {
                $table->json('revoked_permissions')->nullable();
            }
        });

        if (Schema::hasColumn('employees', 'permission_level')
            && DB::connection()->getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE employees MODIFY permission_level TINYINT NOT NULL DEFAULT 1');
        }
    }

    public function down(): void
    {
        // Intentionally non-destructive. This migration only ensures required auth columns exist.
    }
};
