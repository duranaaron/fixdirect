<?php

namespace App\Http\Controllers;

use App\Models\Klusje;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KlusjeController extends Controller
{
    public function index()
    {
        $klusjes = Klusje::with('user')
            ->where('status', 'open')
            ->latest()
            ->get();

        return Inertia::render('find', [
            'klusjes' => $klusjes,
        ]);
    }

    public function show(Klusje $klusje)
    {
        $klusje->load('user');

        return Inertia::render('jobs', [
            'klusje' => $klusje,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'location' => 'required|string|max:255',
            'date' => 'required|date',
            'compensation' => 'required|numeric|min:0',
            'description' => 'required|string',
        ]);

        $request->user()->klusjes()->create($validated);

        return redirect()->route('find');
    }
}
