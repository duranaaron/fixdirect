<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Pre-escrow rows used `succeeded` to mean "charge cleared and klusje
        // auto-completed". The closest new state is `released` — funds left
        // the platform. Backfill released_at from paid_at when available.
        DB::table('payments')
            ->where('status', 'succeeded')
            ->update([
                'status' => 'released',
                'released_at' => DB::raw('COALESCE(released_at, paid_at)'),
            ]);

        // `processing` was only ever a transient state; there shouldn't be
        // any, but fold them into `failed` defensively so the enum casts.
        DB::table('payments')
            ->where('status', 'processing')
            ->update(['status' => 'failed']);
    }

    public function down(): void
    {
        DB::table('payments')
            ->where('status', 'released')
            ->whereNull('stripe_transfer_id')
            ->update(['status' => 'succeeded']);
    }
};
