<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Pivote N:M entre professional_profiles y job_offers, con datos propios del proceso
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('professional_id')->constrained('professional_profiles')->cascadeOnDelete();
            $table->foreignId('job_offer_id')->constrained('job_offers')->cascadeOnDelete();
            $table->enum('status', ['pending', 'reviewed', 'accepted', 'rejected'])->default('pending');
            $table->timestamp('applied_at')->useCurrent();

            // Un profesional no puede postularse dos veces a la misma oferta
            $table->unique(['professional_id', 'job_offer_id']);
            $table->index('job_offer_id'); // listar postulantes de una oferta
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
