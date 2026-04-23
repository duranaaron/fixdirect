<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::query()
            ->when($request->string('search')->isNotEmpty(), function ($q) use ($request) {
                $term = '%'.$request->string('search').'%';
                $q->where(fn ($inner) => $inner->where('name', 'like', $term)->orWhere('email', 'like', $term));
            })
            ->orderBy('name')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => [
                'search' => $request->string('search')->toString(),
            ],
        ]);
    }

    public function show(User $user): Response
    {
        $user->load([
            'klusjes:id,user_id,title,status,created_at',
            'offers:id,klusje_id,klusser_id,status,created_at',
            'reviewsReceived.fromUser:id,name',
            'reviewsReceived.klusje:id,title',
        ]);

        return Inertia::render('admin/users/show', [
            'profile' => $user,
        ]);
    }

    public function suspend(Request $request, User $user): RedirectResponse
    {
        abort_if($user->id === $request->user()->id, 422, 'Je kunt jezelf niet opschorten.');

        $user->update(['suspended_at' => now()]);

        return back()->with('success', "{$user->name} is opgeschort.");
    }

    public function unsuspend(User $user): RedirectResponse
    {
        $user->update(['suspended_at' => null]);

        return back()->with('success', "{$user->name} is weer actief.");
    }
}
