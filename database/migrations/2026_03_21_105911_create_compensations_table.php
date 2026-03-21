<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('compensations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->decimal('basic_salary', 10, 2);
            $table->decimal('housing_allowance', 10, 2)->default(0);
            $table->decimal('transport_allowance', 10, 2)->default(0);
            $table->decimal('other_allowances', 10, 2)->default(0);
            $table->string('currency');
            $table->date('effective_from');
            $table->date('effective_to')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('compensations');
    }
};