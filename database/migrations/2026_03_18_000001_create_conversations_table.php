<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('klusje_id')->constrained('klusjes')->cascadeOnDelete();
            $table->foreignId('starter_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['klusje_id', 'starter_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
