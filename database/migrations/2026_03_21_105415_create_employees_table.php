<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('position');
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('manager_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->tinyInteger('permission_level')->default(1);
            $table->json('permission_override')->nullable();
            $table->json('revoked_permissions')->nullable();
            $table->boolean('must_change_password')->default(false);
            $table->string('status')->default('active');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('employees');
    }
};
