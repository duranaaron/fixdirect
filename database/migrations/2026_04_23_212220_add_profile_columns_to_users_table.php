<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('profile_photo_path')->nullable()->after('email');
            $table->text('bio')->nullable()->after('profile_photo_path');
            $table->string('location')->nullable()->after('bio');
            $table->string('phone', 32)->nullable()->after('location');
            $table->string('stripe_account_id')->nullable()->after('phone');
            $table->timestamp('last_seen_at')->nullable()->after('stripe_account_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'profile_photo_path',
                'bio',
                'location',
                'phone',
                'stripe_account_id',
                'last_seen_at',
            ]);
        });
    }
};
