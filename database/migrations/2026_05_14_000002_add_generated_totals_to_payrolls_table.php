<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('payrolls', function (Blueprint $table) {
            if (! Schema::hasColumn('payrolls', 'gross_salary')) {
                $table->decimal('gross_salary', 10, 2)->default(0)->after('unpaid_leave_amount');
            }
            if (! Schema::hasColumn('payrolls', 'net_salary')) {
                $table->decimal('net_salary', 10, 2)->default(0)->after('gross_salary');
            }
            if (! Schema::hasColumn('payrolls', 'rejection_remarks')) {
                $table->text('rejection_remarks')->nullable()->after('approved_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('payrolls', function (Blueprint $table) {
            $table->dropColumn(['gross_salary', 'net_salary', 'rejection_remarks']);
        });
    }
};
