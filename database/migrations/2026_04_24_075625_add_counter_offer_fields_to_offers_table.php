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
        Schema::table('offers', function (Blueprint $table) {
            $table->decimal('counter_offer_compensation', 8, 2)->nullable()->after('proposed_compensation');
            $table->text('counter_offer_message')->nullable()->after('counter_offer_compensation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('offers', function (Blueprint $table) {
            $table->dropColumn(['counter_offer_compensation', 'counter_offer_message']);
        });
    }
};
