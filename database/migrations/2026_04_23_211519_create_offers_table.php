<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('offers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('klusje_id')->constrained()->cascadeOnDelete();
            $table->foreignId('klusser_id')->constrained('users')->cascadeOnDelete();
            $table->text('message')->nullable();
            $table->decimal('proposed_compensation', 8, 2)->nullable();
            $table->string('status')->default('pending');
            $table->timestamps();

            $table->unique(['klusje_id', 'klusser_id']);
            $table->index(['klusser_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('offers');
    }
};
