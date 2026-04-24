<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('klusje_images', function (Blueprint $table) {
            $table->id();
            // foreignId koppelt dit direct aan de 'klusjes' tabel.
            // cascadeOnDelete zorgt dat als een klusje wordt verwijderd, de foto's ook uit de database verdwijnen.
            $table->foreignId('klusje_id')->constrained('klusjes')->cascadeOnDelete();

            // Het pad naar de afbeelding (bijv. 'uploads/klusjes/foto1.jpg')
            $table->string('image_path');

            // Optioneel: Handig om 1 foto de 'hoofdfoto' te maken voor in je dashboard lijst
            $table->boolean('is_primary')->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('klusje_images');
    }
};
