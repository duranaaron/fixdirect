<?php

namespace App\Http\Controllers;

use App\Models\Klusje;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller; // Zorg dat deze import er staat

class KlusjeController extends Controller
{
    public function index()
    {
        $klusjes = Klusje::with(['user', 'images'])
            ->where('status', 'open')
            ->latest()
            ->get();

        // Matcht met resources/js/pages/find.tsx
        return Inertia::render('find', [
            'klusjes' => $klusjes,
        ]);
    }

    public function show(Klusje $klusje)
    {
        // AANPASSING: Matcht met resources/js/pages/jobs.tsx
        // Verwijder '/show' als je bestand gewoon jobs.tsx heet
        return Inertia::render('jobs', [
            'klusje' => $klusje->load(['images', 'user']) 
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
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        // Dit vereist de klusjes() relatie in je User model
        $klusje = $request->user()->klusjes()->create([
            'title' => $validated['title'],
            'category' => $validated['category'],
            'location' => $validated['location'],
            'date' => $validated['date'],
            'compensation' => $validated['compensation'],
            'description' => $validated['description'],
            'status' => 'open',
        ]);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('klusjes', 'public');
                
                $klusje->images()->create([
                    'image_path' => $path,
                    'is_primary' => $index === 0, 
                ]);
            }
        }

        return redirect()->route('find')->with('success', 'Klusje succesvol geplaatst!');
    }
}