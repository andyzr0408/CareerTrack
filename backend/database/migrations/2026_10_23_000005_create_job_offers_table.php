<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_offers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->string('title');
            $table->enum('modality', ['remote', 'onsite', 'hybrid']);
            $table->string('location')->nullable();
            $table->string('salary_range')->nullable();
            // Ciclo de vida, lo controla la empresa
            $table->enum('status', ['active', 'paused'])->default('active');
            // Moderación, la controla el administrador
            $table->enum('moderation_status', ['pending', 'approved', 'blocked'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_offers');
    }
};
