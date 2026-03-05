// 1. IMPORTS
import { Head, useForm } from '@inertiajs/react'; // useForm helpt bij het versturen van data
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

export default function CreateJob() {
    // 2. FORMULIER INITIALISATIE
    // Hier definiëren we welke velden we willen verzamelen
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        category: 'Montage',
        location: '',
        date: '',
        compensation: '',
        description: '',
    });

    // 3. VERZEND FUNCTIE
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/jobs'); // Dit stuurt de data naar de Laravel 'store' methode
    };

    return (
        <AppLayout>
            <Head title="Nieuwe klus plaatsen - FixDirect" />

            <div className="container mx-auto px-4 py-12 max-w-3xl">
                {/* TITEL SECTIE */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-black text-neutral-900 dark:text-neutral-50 mb-4">
                        Plaats een <span className="text-orange-500">klusje</span>
                    </h1>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        Vul de details in en vind binnen no-time de juiste helper.
                    </p>
                </div>

                {/* HET FORMULIER */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white dark:bg-neutral-900 rounded-[2rem] p-8 border border-neutral-100 dark:border-neutral-800 shadow-sm space-y-8">
                        
                        {/* INPUT: TITEL */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 font-bold text-neutral-700 dark:text-neutral-300">
                                <Hammer className="h-4 w-4 text-orange-500" /> Wat moet er gebeuren?
                            </label>
                            <input 
                                type="text"
                                placeholder="Bv. IKEA PAX kast monteren"
                                className="w-full h-12 px-4 rounded-2xl border-neutral-200 bg-neutral-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all dark:bg-neutral-800 dark:border-neutral-700"
                                onChange={e => setData('title', e.target.value)}
                            />
                            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                        </div>

                        {/* GRID VOOR LOCATIE EN DATUM */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 font-bold text-neutral-700 dark:text-neutral-300">
                                    <MapPin className="h-4 w-4 text-blue-500" /> Waar is het?
                                </label>
                                <input 
                                    type="text"
                                    placeholder="Stad of postcode"
                                    className="w-full h-12 px-4 rounded-2xl border-neutral-200 bg-neutral-50 outline-none dark:bg-neutral-800 dark:border-neutral-700"
                                    onChange={e => setData('location', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 font-bold text-neutral-700 dark:text-neutral-300">
                                    <Calendar className="h-4 w-4 text-green-500" /> Wanneer?
                                </label>
                                <input 
                                    type="date"
                                    className="w-full h-12 px-4 rounded-2xl border-neutral-200 bg-neutral-50 outline-none dark:bg-neutral-800 dark:border-neutral-700 text-neutral-500"
                                    onChange={e => setData('date', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* INPUT: VERGOEDING */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 font-bold text-neutral-700 dark:text-neutral-300">
                                <Euro className="h-4 w-4 text-orange-500" /> Wat is je budget?
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">€</span>
                                <input 
                                    type="number"
                                    placeholder="0.00"
                                    className="w-full h-12 pl-8 pr-4 rounded-2xl border-neutral-200 bg-neutral-50 outline-none dark:bg-neutral-800 dark:border-neutral-700"
                                    onChange={e => setData('compensation', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* INPUT: BESCHRIJVING */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 font-bold text-neutral-700 dark:text-neutral-300">
                                <AlignLeft className="h-4 w-4 text-purple-500" /> Omschrijving
                            </label>
                            <textarea 
                                rows={4}
                                placeholder="Geef een duidelijke uitleg van de klus..."
                                className="w-full p-4 rounded-2xl border-neutral-200 bg-neutral-50 outline-none dark:bg-neutral-800 dark:border-neutral-700"
                                onChange={e => setData('description', e.target.value)}
                            />
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
                    <div className="flex items-start gap-3 p-6 bg-blue-50/50 dark:bg-neutral-900/50 rounded-3xl border border-blue-100 dark:border-neutral-800">
                        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            Door een klusje te plaatsen ga je akkoord met onze voorwaarden. Zorg dat je omschrijving eerlijk en duidelijk is voor de beste resultaten.
                        </p>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}