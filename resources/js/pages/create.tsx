import { Head, useForm } from '@inertiajs/react';
import {
    Hammer,
    MapPin,
    Euro,
    AlignLeft,
    Calendar,
    ArrowRight,
    Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';

const categories = [
    'Montage',
    'Verhuizen',
    'Schilderen',
    'Tuinieren',
    'Schoonmaak',
    'Reparatie',
    'Overig',
];

export default function CreateJob() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        category: 'Montage',
        location: '',
        date: '',
        compensation: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/jobs');
    };

    return (
        <AppLayout>
            <Head title="Nieuwe klus plaatsen - FixDirect" />

            <div className="container mx-auto px-4 py-12 max-w-3xl">
                {/* TITEL SECTIE */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-black text-neutral-900 mb-4">
                        Plaats een <span className="text-orange-500">klusje</span>
                    </h1>
                    <p className="text-neutral-600">
                        Vul de details in en vind binnen no-time de juiste helper.
                    </p>
                </div>

                {/* HET FORMULIER */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-[2rem] p-8 border border-neutral-100 shadow-sm space-y-8">

                        {/* INPUT: TITEL */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 font-bold text-neutral-700">
                                <Hammer className="h-4 w-4 text-orange-500" /> Wat moet er gebeuren?
                            </label>
                            <input
                                type="text"
                                value={data.title}
                                placeholder="Bv. IKEA PAX kast monteren"
                                className="w-full h-12 px-4 rounded-2xl border-neutral-200 bg-neutral-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                onChange={e => setData('title', e.target.value)}
                            />
                            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                        </div>

                        {/* SELECT: CATEGORIE */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 font-bold text-neutral-700">
                                <Hammer className="h-4 w-4 text-purple-500" /> Categorie
                            </label>
                            <select
                                value={data.category}
                                className="w-full h-12 px-4 rounded-2xl border-neutral-200 bg-neutral-50 outline-none"
                                onChange={e => setData('category', e.target.value)}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
                        </div>

                        {/* GRID VOOR LOCATIE EN DATUM */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 font-bold text-neutral-700">
                                    <MapPin className="h-4 w-4 text-blue-500" /> Waar is het?
                                </label>
                                <input
                                    type="text"
                                    value={data.location}
                                    placeholder="Stad of postcode"
                                    className="w-full h-12 px-4 rounded-2xl border-neutral-200 bg-neutral-50 outline-none"
                                    onChange={e => setData('location', e.target.value)}
                                />
                                {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 font-bold text-neutral-700">
                                    <Calendar className="h-4 w-4 text-green-500" /> Wanneer?
                                </label>
                                <input
                                    type="date"
                                    value={data.date}
                                    className="w-full h-12 px-4 rounded-2xl border-neutral-200 bg-neutral-50 outline-none text-neutral-500"
                                    onChange={e => setData('date', e.target.value)}
                                />
                                {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
                            </div>
                        </div>

                        {/* INPUT: VERGOEDING */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 font-bold text-neutral-700">
                                <Euro className="h-4 w-4 text-orange-500" /> Wat is je budget?
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">€</span>
                                <input
                                    type="number"
                                    value={data.compensation}
                                    placeholder="0.00"
                                    className="w-full h-12 pl-8 pr-4 rounded-2xl border-neutral-200 bg-neutral-50 outline-none"
                                    onChange={e => setData('compensation', e.target.value)}
                                />
                            </div>
                            {errors.compensation && <p className="text-red-500 text-sm">{errors.compensation}</p>}
                        </div>

                        {/* INPUT: BESCHRIJVING */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 font-bold text-neutral-700">
                                <AlignLeft className="h-4 w-4 text-purple-500" /> Omschrijving
                            </label>
                            <textarea
                                rows={4}
                                value={data.description}
                                placeholder="Geef een duidelijke uitleg van de klus..."
                                className="w-full p-4 rounded-2xl border-neutral-200 bg-neutral-50 outline-none"
                                onChange={e => setData('description', e.target.value)}
                            />
                            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                        </div>

                        {/* SUBMIT KNOP */}
                        <Button
                            disabled={processing}
                            type="submit"
                            className="w-full h-14 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                        >
                            {processing ? 'Bezig met plaatsen...' : 'Klusje plaatsen'}
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>

                    {/* EXTRA INFO BOX */}
                    <div className="flex items-start gap-3 p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-neutral-600 leading-relaxed">
                            Door een klusje te plaatsen ga je akkoord met onze voorwaarden. Zorg dat je omschrijving eerlijk en duidelijk is voor de beste resultaten.
                        </p>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}