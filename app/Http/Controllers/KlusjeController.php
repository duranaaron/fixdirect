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
    // 1. Toon de bewerk-pagina
    public function edit(Klusje $klusje)
    {
        // BEVEILIGING: Is de ingelogde gebruiker wel de eigenaar?
        abort_if($klusje->user_id !== auth()->id(), 403, 'Je mag alleen je eigen klusjes bewerken.');

        return Inertia::render('edit', [
            // We sturen de bestaande data mee, zodat we het formulier kunnen invullen
            'klusje' => $klusje->load('images')
        ]);
    }

    public function update(Request $request, Klusje $klusje)
    {
        // 1. Beveiliging: is dit de eigenaar?
        abort_if($klusje->user_id !== auth()->id(), 403);

        // 2. Valideer de inkomende data (inclusief de nieuwe array voor foto's)
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'location' => 'required|string|max:255',
            'date' => 'required|date',
            'compensation' => 'required|numeric|min:0',
            'description' => 'required|string',
            'new_images.*' => 'nullable|image|max:4096', // Max 4MB per nieuwe foto
            'deleted_images' => 'nullable|array',
            'deleted_images.*' => 'integer',
        ]);

        // 3. Update de normale tekstvelden
        $klusje->update([
            'title' => $validated['title'],
            'category' => $validated['category'],
            'location' => $validated['location'],
            'date' => $validated['date'],
            'compensation' => $validated['compensation'],
            'description' => $validated['description'],
        ]);

        // 4. Verwijder de geselecteerde oude foto's
        if ($request->filled('deleted_images')) {
            // Haal de foto's op die bij dit klusje horen én in de verwijder-lijst staan
            $imagesToDelete = $klusje->images()->whereIn('id', $request->deleted_images)->get();

            foreach ($imagesToDelete as $image) {
                // Verwijder het bestand fysiek van de server
                \Illuminate\Support\Facades\Storage::disk('public')->delete($image->image_path);
                // Verwijder de regel uit de database
                $image->delete();
            }
        }

        // 5. Sla eventuele nieuwe foto's op
        if ($request->hasFile('new_images')) {
            foreach ($request->file('new_images') as $file) {
                $path = $file->store('klusjes', 'public');
                $klusje->images()->create([
                    'image_path' => $path,
                ]);
            }
        }

        return redirect()->route('jobs.show', $klusje->id)->with('success', 'Klusje succesvol gewijzigd!');
    }

    // 3. Verwijder het klusje
    public function destroy(Klusje $klusje)
    {
        abort_if($klusje->user_id !== auth()->id(), 403);
        $klusje->delete();

        return redirect()->route('dashboard')->with('success', 'Klusje succesvol verwijderd.');
    }
}
