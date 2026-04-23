import { useForm } from '@inertiajs/react';
import { AlignLeft, ArrowRight, Calendar, Euro, Hammer, Info, MapPin, UploadCloud, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { KlusjeImage } from '@/types';

const categories = ['Montage', 'Verhuizen', 'Schilderen', 'Tuinieren', 'Schoonmaak', 'Reparatie', 'Overig'];

type Mode = 'create' | 'edit';

interface KlusjeFormProps {
    mode: Mode;
    klusjeId?: number;
    initial?: {
        title: string;
        category: string;
        location: string;
        date: string;
        compensation: string;
        description: string;
        images?: KlusjeImage[];
    };
}

export default function KlusjeForm({ mode, klusjeId, initial }: KlusjeFormProps) {
    const { data, setData, post, processing, errors, transform } = useForm({
        title: initial?.title ?? '',
        category: initial?.category ?? 'Montage',
        location: initial?.location ?? '',
        date: initial?.date ?? '',
        compensation: initial?.compensation ?? '',
        description: initial?.description ?? '',
        images: [] as File[],
        removed_image_ids: [] as number[],
        _method: mode === 'edit' ? 'PATCH' : 'POST',
    });

    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<KlusjeImage[]>(initial?.images ?? []);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setData('images', [...data.images, ...newFiles]);
            setPreviewUrls([...previewUrls, ...newFiles.map((f) => URL.createObjectURL(f))]);
        }
    };

    const removeNewImage = (indexToRemove: number) => {
        setData(
            'images',
            data.images.filter((_, i) => i !== indexToRemove),
        );
        setPreviewUrls(previewUrls.filter((_, i) => i !== indexToRemove));
    };

    const removeExistingImage = (image: KlusjeImage) => {
        setExistingImages(existingImages.filter((i) => i.id !== image.id));
        setData('removed_image_ids', [...data.removed_image_ids, image.id]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        transform((data) => {
            const cleaned: Record<string, unknown> = { ...data };
            if (mode === 'create') {
                delete cleaned._method;
                delete cleaned.removed_image_ids;
            }
            return cleaned as typeof data;
        });

        const url = mode === 'create' ? '/jobs' : `/jobs/${klusjeId}`;
        post(url, { forceFormData: true });
    };

    const heading = mode === 'create' ? 'Plaats een' : 'Bewerk je';

    return (
        <div className="container mx-auto max-w-3xl px-4 py-12">
            <div className="mb-10 text-center">
                <h1 className="mb-4 text-4xl font-black text-neutral-900">
                    {heading} <span className="text-orange-500">klusje</span>
                </h1>
                <p className="text-neutral-600">
                    {mode === 'create'
                        ? "Vul de details in, voeg foto's toe en vind binnen no-time de juiste helper."
                        : 'Pas de details aan zolang je klus nog openstaat.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                <div className="space-y-8 rounded-[2rem] border border-neutral-100 bg-white p-8 shadow-sm">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 font-bold text-neutral-700">
                            <Hammer className="h-4 w-4 text-orange-500" /> Wat moet er gebeuren?
                        </label>
                        <input
                            type="text"
                            value={data.title}
                            placeholder="Bv. IKEA PAX kast monteren"
                            className="h-12 w-full rounded-2xl border-neutral-200 bg-neutral-50 px-4 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-orange-500"
                            onChange={(e) => setData('title', e.target.value)}
                        />
                        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 font-bold text-neutral-700">
                            <Hammer className="h-4 w-4 text-purple-500" /> Categorie
                        </label>
                        <select
                            value={data.category}
                            className="h-12 w-full rounded-2xl border-neutral-200 bg-neutral-50 px-4 outline-none"
                            onChange={(e) => setData('category', e.target.value)}
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                        {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 font-bold text-neutral-700">
                                <MapPin className="h-4 w-4 text-blue-500" /> Waar is het?
                            </label>
                            <input
                                type="text"
                                value={data.location}
                                placeholder="Stad of postcode"
                                className="h-12 w-full rounded-2xl border-neutral-200 bg-neutral-50 px-4 outline-none"
                                onChange={(e) => setData('location', e.target.value)}
                            />
                            {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 font-bold text-neutral-700">
                                <Calendar className="h-4 w-4 text-green-500" /> Wanneer?
                            </label>
                            <input
                                type="date"
                                value={data.date}
                                className="h-12 w-full rounded-2xl border-neutral-200 bg-neutral-50 px-4 text-neutral-500 outline-none"
                                onChange={(e) => setData('date', e.target.value)}
                            />
                            {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 font-bold text-neutral-700">
                            <Euro className="h-4 w-4 text-orange-500" /> Wat is je budget?
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">€</span>
                            <input
                                type="number"
                                step="0.01"
                                value={data.compensation}
                                placeholder="0.00"
                                className="h-12 w-full rounded-2xl border-neutral-200 bg-neutral-50 pl-8 pr-4 outline-none"
                                onChange={(e) => setData('compensation', e.target.value)}
                            />
                        </div>
                        {errors.compensation && <p className="text-sm text-red-500">{errors.compensation}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 font-bold text-neutral-700">
                            <AlignLeft className="h-4 w-4 text-purple-500" /> Omschrijving
                        </label>
                        <textarea
                            rows={4}
                            value={data.description}
                            placeholder="Geef een duidelijke uitleg van de klus..."
                            className="w-full rounded-2xl border-neutral-200 bg-neutral-50 p-4 outline-none"
                            onChange={(e) => setData('description', e.target.value)}
                        />
                        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center gap-2 font-bold text-neutral-700">
                            <UploadCloud className="h-4 w-4 text-blue-500" /> Foto's toevoegen (Optioneel)
                        </label>

                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                        />

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="group flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-8 transition-colors hover:bg-neutral-100"
                        >
                            <div className="mb-3 rounded-full bg-white p-3 shadow-sm transition-transform group-hover:scale-105">
                                <UploadCloud className="h-6 w-6 text-blue-500" />
                            </div>
                            <p className="text-sm font-medium text-neutral-900">Klik hier om foto's te uploaden</p>
                            <p className="mt-1 text-xs text-neutral-500">PNG, JPG of JPEG (max. 5MB per foto)</p>
                        </div>

                        {errors.images && <p className="text-sm text-red-500">{errors.images}</p>}

                        {(existingImages.length > 0 || previewUrls.length > 0) && (
                            <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
                                {existingImages.map((img) => (
                                    <div
                                        key={`existing-${img.id}`}
                                        className="group relative aspect-square overflow-hidden rounded-xl border border-neutral-200 shadow-sm"
                                    >
                                        <img
                                            src={`/storage/${img.image_path}`}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(img)}
                                            className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 shadow-sm transition-opacity hover:bg-red-600 group-hover:opacity-100"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                                {previewUrls.map((url, index) => (
                                    <div
                                        key={`new-${index}`}
                                        className="group relative aspect-square overflow-hidden rounded-xl border border-neutral-200 shadow-sm"
                                    >
                                        <img src={url} alt="" className="h-full w-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(index)}
                                            className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 shadow-sm transition-opacity hover:bg-red-600 group-hover:opacity-100"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <Button
                        disabled={processing}
                        type="submit"
                        className="mt-4 h-14 w-full rounded-2xl bg-orange-500 text-lg font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95"
                    >
                        {processing
                            ? mode === 'create'
                                ? 'Bezig met plaatsen...'
                                : 'Opslaan...'
                            : mode === 'create'
                              ? 'Klusje plaatsen'
                              : 'Wijzigingen opslaan'}
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>

                <div className="flex items-start gap-3 rounded-3xl border border-blue-100 bg-blue-50/50 p-6">
                    <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                    <p className="text-sm leading-relaxed text-neutral-600">
                        {mode === 'create'
                            ? 'Door een klusje te plaatsen ga je akkoord met onze voorwaarden. Zorg dat je omschrijving eerlijk en duidelijk is voor de beste resultaten.'
                            : 'Zodra een klusser is toegewezen, kun je de klus niet meer wijzigen.'}
                    </p>
                </div>
            </form>
        </div>
    );
}
