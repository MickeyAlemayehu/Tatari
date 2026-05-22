<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('job_vacancies', function (Blueprint $table) {
            if (! Schema::hasColumn('job_vacancies', 'location')) {
                $table->string('location')->nullable()->after('department_id');
            }
            if (! Schema::hasColumn('job_vacancies', 'salary_min')) {
                $table->decimal('salary_min', 12, 2)->nullable()->after('number_of_positions');
            }
            if (! Schema::hasColumn('job_vacancies', 'salary_max')) {
                $table->decimal('salary_max', 12, 2)->nullable()->after('salary_min');
            }
            if (! Schema::hasColumn('job_vacancies', 'salary_text')) {
                $table->string('salary_text')->nullable()->after('salary_max');
            }
            if (! Schema::hasColumn('job_vacancies', 'responsibilities')) {
                $table->text('responsibilities')->nullable()->after('description');
            }
            if (! Schema::hasColumn('job_vacancies', 'benefits')) {
                $table->text('benefits')->nullable()->after('requirements');
            }
        });

        Schema::table('applicants', function (Blueprint $table) {
            if (! Schema::hasColumn('applicants', 'location')) {
                $table->string('location')->nullable()->after('phone');
            }
            if (! Schema::hasColumn('applicants', 'experience')) {
                $table->string('experience')->nullable()->after('location');
            }
            if (! Schema::hasColumn('applicants', 'rating')) {
                $table->decimal('rating', 2, 1)->nullable()->after('status');
            }
            if (! Schema::hasColumn('applicants', 'current_company')) {
                $table->string('current_company')->nullable()->after('rating');
            }
            if (! Schema::hasColumn('applicants', 'education')) {
                $table->string('education')->nullable()->after('current_company');
            }
            if (! Schema::hasColumn('applicants', 'notice_period')) {
                $table->string('notice_period')->nullable()->after('education');
            }
        });
    }

    public function down(): void
    {
        Schema::table('applicants', function (Blueprint $table) {
            $table->dropColumn([
                'location',
                'experience',
                'rating',
                'current_company',
                'education',
                'notice_period',
            ]);
        });

        Schema::table('job_vacancies', function (Blueprint $table) {
            $table->dropColumn([
                'location',
                'salary_min',
                'salary_max',
                'salary_text',
                'responsibilities',
                'benefits',
            ]);
        });
    }
};
