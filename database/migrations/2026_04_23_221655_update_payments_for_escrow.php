<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->timestamp('held_at')->nullable()->after('paid_at');
            $table->timestamp('released_at')->nullable()->after('held_at');
            $table->timestamp('refunded_at')->nullable()->after('released_at');
            $table->string('stripe_transfer_id')->nullable()->after('stripe_payment_intent_id');
            $table->string('stripe_refund_id')->nullable()->after('stripe_transfer_id');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn([
                'held_at',
                'released_at',
                'refunded_at',
                'stripe_transfer_id',
                'stripe_refund_id',
            ]);
        });
    }
};
