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
            
            // 1. AANGEPAST: nullable() toegevoegd zodat we eigen opwaarderingen kunnen doen!
            $table->foreignId('klusje_id')->nullable()->constrained()->cascadeOnDelete();
            
            $table->foreignId('payer_id')->constrained('users');
            $table->foreignId('payee_id')->constrained('users');
            $table->decimal('amount', 8, 2);
            $table->decimal('platform_fee', 8, 2)->default(0); // Handig om hier een default te hebben
            $table->string('currency', 3)->default('eur');
            
            $table->string('stripe_payment_intent_id')->nullable()->unique();
            $table->string('stripe_checkout_session_id')->nullable();
            
            // 2. NIEUW: Deze misten nog in je migratie, maar stonden wel in je Model!
            $table->string('stripe_transfer_id')->nullable();
            $table->string('stripe_refund_id')->nullable();
            
            $table->string('status')->default('pending');
            
            $table->timestamp('paid_at')->nullable();
            // 3. NIEUW: Deze timestamps misten ook nog
            $table->timestamp('held_at')->nullable();
            $table->timestamp('released_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            
            $table->timestamps();

            $table->index(['klusje_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};