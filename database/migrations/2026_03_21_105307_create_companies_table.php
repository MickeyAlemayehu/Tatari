<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('company_name');
            $table->string('email')->unique();
            $table->string('phone');
            $table->string('address')->nullable();
            $table->string('logo')->nullable();
            $table->date('expiration_date');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('companies');
    }
};