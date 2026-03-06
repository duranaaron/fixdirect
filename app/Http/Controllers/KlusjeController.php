<?php

namespace App\Http\Controllers;

use App\Models\Klusje;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KlusjeController extends Controller
{
    public function index()
    {
        // FIX 1: Voeg 'images' toe aan de with() functie, 
        // zodat de Find.tsx pagina direct de foto's heeft voor de JobCard.
        $klusjes = Klusje::with(['user', 'images'])
            ->where('status', 'open')
            ->latest()
            ->get();

        // Let op: zorg dat dit exact overeenkomt met je bestandsnaam in resources/js/Pages/
        // Bijv: 'Find' (met een hoofdletter F) is standaard in React.
        return Inertia::render('find', [
            'klusjes' => $klusjes,
        ]);
    }

    public function show(Klusje $klusje)
    {
        $klusje->load('user', 'images');

        // FIX 2: Vóór de foto-update stuurde je mensen misschien naar 'jobs'. 
        // Maar ons nieuwe React component heet 'JobDetail'. 
        // Pas dit aan naar de EXACTE naam van je .tsx bestand (zonder .tsx)!
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
            // FIX 3A: Valideer de inkomende afbeeldingen
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg|max:5120', // max 5MB per foto
        ]);

        // Sla het klusje op (zonder de images array, want die moet in een andere tabel)
        $klusje = $request->user()->klusjes()->create([
            'title' => $validated['title'],
            'category' => $validated['category'],
            'location' => $validated['location'],
            'date' => $validated['date'],
            'compensation' => $validated['compensation'],
            'description' => $validated['description'],
        ]);

        // FIX 3B: Sla de foto's op in de storage en koppel ze aan het klusje
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                // Sla de foto op in 'storage/app/public/klusjes'
                $path = $image->store('klusjes', 'public');
                
                // Maak een record aan in de klusje_images tabel
                $klusje->images()->create([
                    'image_path' => $path,
                    // Maak de allereerste foto (index 0) de hoofdfoto (primary)
                    'is_primary' => $index === 0 ? true : false, 
                ]);
            }
        }

        return redirect()->route('find');
    }
}