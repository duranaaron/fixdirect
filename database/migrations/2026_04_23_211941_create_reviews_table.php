<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('klusje_id')->constrained()->cascadeOnDelete();
            $table->foreignId('from_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('to_user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->unique(['klusje_id', 'from_user_id', 'to_user_id']);
            $table->index('to_user_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->decimal('rating_avg', 3, 2)->nullable()->after('email_verified_at');
            $table->unsignedInteger('rating_count')->default(0)->after('rating_avg');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['rating_avg', 'rating_count']);
        });
        Schema::dropIfExists('reviews');
    }
};
