<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('job_vacancies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('department_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description');
            $table->text('requirements')->nullable();
            $table->string('employment_type'); // full-time, part-time, contract
            $table->integer('number_of_positions');
            $table->date('opening_date');
            $table->date('closing_date');
            $table->string('status')->default('draft');
            $table->foreignId('created_by')->nullable()->constrained('employees')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('job_vacancies');
    }
};