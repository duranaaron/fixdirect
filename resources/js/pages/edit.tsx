import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft, LoaderCircle, Save, Trash2, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import type { Klusje } from '@/types';

export default function EditJob({ klusje }: { klusje: Klusje }) {
    // 1. Voeg _method, deleted_images en new_images toe
    const { data, setData, post, processing, errors } = useForm({
        _method: 'put', // BELANGRIJK: Hiermee foppen we Laravel zodat file uploads werken op een update route
        title: klusje.title || '',
        category: klusje.category || '',
        location: klusje.location || '',
        date: klusje.date || '',
        compensation: klusje.compensation || '',
        description: klusje.description || '',
        new_images: [] as File[],
        deleted_images: [] as number[],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // 2. Gebruik post() in plaats van put(), omdat we bestanden meesturen
        post(`/jobs/${klusje.id}`);
    };

    // 3. Helper functie om een foto aan te vinken voor verwijdering
    const toggleDeleteImage = (imageId: number) => {
        if (data.deleted_images.includes(imageId)) {
            // Haal hem weer uit de verwijder-lijst (gebruiker heeft zich bedacht)
            setData('deleted_images', data.deleted_images.filter(id => id !== imageId));
        } else {
            // Voeg toe aan de verwijder-lijst
            setData('deleted_images', [...data.deleted_images, imageId]);
        }
    };

    return (
        <AppLayout>
            <Head title="Klusje bewerken - FixDirect" />

            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <Link
                    href={`/jobs/${klusje.id}`}
                    className="flex items-center text-sm font-medium text-neutral-500 hover:text-orange-600 transition-colors mb-6 w-fit"
                >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Terug naar details
                </Link>

                <div className="bg-white rounded-[2rem] p-8 border border-neutral-100 shadow-sm">
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-neutral-900">Klusje bewerken</h1>
                        <p className="text-neutral-500 mt-2 font-medium">Pas de details en foto's van je klusje aan.</p>
                    </div>

                    <form onSubmit={submit} className="flex flex-col gap-8" encType="multipart/form-data">

                        {/* FOTO SECTIE */}
                        <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100 space-y-4">
                            <Label className="text-lg font-bold text-neutral-900">Foto's beheren</Label>

                            {/* Bestaande foto's tonen */}
                            {klusje.images && klusje.images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    {klusje.images.map((img) => {
                                        const isDeleted = data.deleted_images.includes(img.id);
                                        return (
                                            <div key={img.id} className="relative group rounded-xl overflow-hidden border-2 border-transparent">
                                                <img
                                                    src={`/storage/${img.image_path}`}
                                                    alt="Klusje foto"
                                                    className={`w-full h-24 object-cover transition-all ${isDeleted ? 'opacity-30 grayscale' : ''}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => toggleDeleteImage(img.id)}
                                                    className={`absolute inset-0 flex items-center justify-center transition-all ${isDeleted ? 'bg-red-500/20' : 'bg-black/0 hover:bg-black/40'}`}
                                                >
                                                    {isDeleted ? (
                                                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">Wordt verwijderd</span>
                                                    ) : (
                                                        <Trash2 className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md" />
                                                    )}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Nieuwe foto's toevoegen */}
                            <div className="grid gap-2">
                                <Label htmlFor="new_images" className="font-semibold text-neutral-700">Nieuwe foto's toevoegen</Label>
                                <Input
                                    id="new_images"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => setData('new_images', Array.from(e.target.files || []))}
                                    className="cursor-pointer bg-white"
                                />
                                <p className="text-xs text-neutral-500">Selecteer één of meerdere bestanden (Max 4MB per foto).</p>
                                <InputError message={errors.new_images} />
                            </div>
                        </div>

                        {/* --- DE REST VAN DE VELDEN --- */}
                        <div className="grid gap-2">
                            <Label htmlFor="title" className="font-semibold text-neutral-700">Titel van de klus</Label>
                            <Input
                                id="title"
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="rounded-xl border-neutral-200 focus:ring-orange-500 focus:border-orange-500 h-12"
                                required
                            />
                            <InputError message={errors.title} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="category" className="font-semibold text-neutral-700">Categorie</Label>
                                <Input
                                    id="category"
                                    type="text"
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    className="rounded-xl border-neutral-200 focus:ring-orange-500 focus:border-orange-500 h-12"
                                    required
                                />
                                <InputError message={errors.category} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="location" className="font-semibold text-neutral-700">Locatie / Gemeente</Label>
                                <Input
                                    id="location"
                                    type="text"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                    className="rounded-xl border-neutral-200 focus:ring-orange-500 focus:border-orange-500 h-12"
                                    required
                                />
                                <InputError message={errors.location} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="date" className="font-semibold text-neutral-700">Datum</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                    className="rounded-xl border-neutral-200 focus:ring-orange-500 focus:border-orange-500 h-12"
                                    required
                                />
                                <InputError message={errors.date} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="compensation" className="font-semibold text-neutral-700">Vergoeding (€)</Label>
                                <Input
                                    id="compensation"
                                    type="number"
                                    step="0.01"
                                    value={data.compensation}
                                    onChange={(e) => setData('compensation', e.target.value)}
                                    className="rounded-xl border-neutral-200 focus:ring-orange-500 focus:border-orange-500 h-12"
                                    required
                                />
                                <InputError message={errors.compensation} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description" className="font-semibold text-neutral-700">Omschrijving</Label>
                            <textarea
                                id="description"
                                rows={6}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="w-full resize-none rounded-2xl border border-neutral-200 p-4 text-sm focus:border-orange-500 focus:ring-orange-500 outline-none transition-all"
                                required
                            />
                            <InputError message={errors.description} />
                        </div>

                        {/* SUBMIT BUTTON */}
                        <div className="flex justify-end pt-4 border-t border-neutral-100">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="h-12 px-8 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:from-orange-600 hover:to-orange-700 active:scale-[0.98]"
                            >
                                {processing ? <LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                                Wijzigingen opslaan
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
