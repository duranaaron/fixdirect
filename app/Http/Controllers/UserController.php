<?php

namespace App\Http\Controllers;

use App\Models\Klusje;
use App\Models\User;
use Inertia\Inertia;

class UserController extends Controller
{
    public function show(User $user)
    {
        // Haal alleen de voltooide klusjes van deze user op
        $completedKlusjes = Klusje::where('user_id', $user->id)
            ->where('status', 'completed') // Let op: check of jouw database kolom 'status' heeft en 'completed' gebruikt
            ->latest()
            ->get();

        // Stuur de data naar de React pagina
        // Let op: 'UserProfile' moet exact overeenkomen met je bestandsnaam in resources/js/pages/
        return Inertia::render('UserProfile', [
            'profileUser' => [
                'id' => $user->id,
                'name' => $user->name,
                'created_at' => $user->created_at,
            ],
            'completedKlusjes' => $completedKlusjes,
        ]);
    }
}
