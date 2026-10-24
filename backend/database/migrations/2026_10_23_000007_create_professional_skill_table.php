<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Pivote N:M entre professional_profiles y skills
        Schema::create('professional_skill', function (Blueprint $table) {
            $table->id();
            $table->foreignId('professional_id')->constrained('professional_profiles')->cascadeOnDelete();
            $table->foreignId('skill_id')->constrained('skills')->cascadeOnDelete();

            $table->unique(['professional_id', 'skill_id']);
            $table->index('skill_id'); // buscar profesionales por skill
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('professional_skill');
    }
};
