<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('klusjes', function (Blueprint $table) {
            $table->foreignId('assigned_klusser_id')
                ->nullable()
                ->after('user_id')
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('completed_at')->nullable()->after('status');
            $table->timestamp('cancelled_at')->nullable()->after('completed_at');

            $table->index(['status', 'category']);
            $table->index('date');
        });
    }

    public function down(): void
    {
        Schema::table('klusjes', function (Blueprint $table) {
            $table->dropIndex(['status', 'category']);
            $table->dropIndex(['date']);
            $table->dropConstrainedForeignId('assigned_klusser_id');
            $table->dropColumn(['completed_at', 'cancelled_at']);
        });
    }
};
