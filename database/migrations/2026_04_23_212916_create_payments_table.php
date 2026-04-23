<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('klusje_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payer_id')->constrained('users');
            $table->foreignId('payee_id')->constrained('users');
            $table->decimal('amount', 8, 2);
            $table->decimal('platform_fee', 8, 2);
            $table->string('currency', 3)->default('eur');
            $table->string('stripe_payment_intent_id')->nullable()->unique();
            $table->string('stripe_checkout_session_id')->nullable();
            $table->string('status')->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['klusje_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
