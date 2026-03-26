<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            // Welk klusje gaat het om?
            $table->foreignId('klusje_id')->constrained()->cascadeOnDelete();

            // Wie schrijft de review?
            $table->foreignId('reviewer_id')->constrained('users')->cascadeOnDelete();

            // Over wie gaat de review?
            $table->foreignId('reviewee_id')->constrained('users')->cascadeOnDelete();

            // De score (bijv. 1 tot 5 sterren)
            $table->tinyInteger('rating');

            // Optionele geschreven feedback
            $table->text('comment')->nullable();

            $table->timestamps();

            // BELANGRIJK: Een gebruiker mag maar 1 review per klusje schrijven
            $table->unique(['klusje_id', 'reviewer_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
