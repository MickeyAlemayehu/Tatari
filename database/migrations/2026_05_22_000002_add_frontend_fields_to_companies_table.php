<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table): void {
            if (! Schema::hasColumn('companies', 'industry')) {
                $table->string('industry')->nullable()->after('expiration_date');
            }
            if (! Schema::hasColumn('companies', 'size')) {
                $table->string('size')->nullable()->after('industry');
            }
            if (! Schema::hasColumn('companies', 'country')) {
                $table->string('country')->nullable()->after('size');
            }
            if (! Schema::hasColumn('companies', 'city')) {
                $table->string('city')->nullable()->after('country');
            }
            if (! Schema::hasColumn('companies', 'website')) {
                $table->string('website')->nullable()->after('city');
            }
            if (! Schema::hasColumn('companies', 'contact_name')) {
                $table->string('contact_name')->nullable()->after('website');
            }
            if (! Schema::hasColumn('companies', 'contact_email')) {
                $table->string('contact_email')->nullable()->after('contact_name');
            }
            if (! Schema::hasColumn('companies', 'contact_phone')) {
                $table->string('contact_phone')->nullable()->after('contact_email');
            }
            if (! Schema::hasColumn('companies', 'contact_title')) {
                $table->string('contact_title')->nullable()->after('contact_phone');
            }
            if (! Schema::hasColumn('companies', 'employee_count')) {
                $table->unsignedInteger('employee_count')->nullable()->after('contact_title');
            }
            if (! Schema::hasColumn('companies', 'description')) {
                $table->text('description')->nullable()->after('employee_count');
            }
            if (! Schema::hasColumn('companies', 'registration_number')) {
                $table->string('registration_number')->nullable()->after('description');
            }
            if (! Schema::hasColumn('companies', 'status')) {
                $table->string('status')->default('approved')->after('registration_number');
            }
        });
    }

    public function down(): void
    {
        // Intentionally non-destructive for existing company data.
    }
};
