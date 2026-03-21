<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('leave_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('max_days_per_year');
            $table->boolean('is_paid');
            $table->boolean('allow_half_day')->default(false);
            $table->boolean('carry_forward_allowed')->default(false);
            $table->integer('max_carry_forward_days')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('leave_types');
    }
};