<?php

namespace App\Http\Middleware;

use App\Enums\PaymentStatus;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'unreadConversationsCount' => $request->user()
                ? Message::query()
                    ->whereIn('conversation_id', Conversation::query()->forUser($request->user())->select('id'))
                    ->where('user_id', '!=', $request->user()->id)
                    ->whereNull('read_at')
                    ->count()
                : 0,
            'unreadNotificationsCount' => $request->user()
                ? $request->user()->unreadNotifications()->count()
                : 0,
            'userBalance' => $request->user()
                ? number_format(
                    (float) Payment::where('payee_id', $request->user()->id)
                        ->where('status', PaymentStatus::Released->value)
                        ->selectRaw('COALESCE(SUM(amount - platform_fee), 0) as net')
                        ->value('net'),
                    2, ',', '.'
                )
                : null,
        ];
    }
}
