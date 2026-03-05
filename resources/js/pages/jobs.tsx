// 1. IMPORTS
// We halen de nodige Inertia tools en icoontjes binnen die passen bij je ontwerp.
import { Head, Link } from '@inertiajs/react';
import { 
    MapPin, 
    Calendar, 
    ChevronLeft, 
    MessageSquare, 
    ShieldCheck, 
    Info, 
    User,
    Star,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';

// We gaan ervan uit dat we 'job' data binnenkrijgen als prop vanuit de Laravel controller.
export default function JobDetail() { // We halen { job } weg uit de haakjes
    
    // We maken hier een tijdelijke 'hardcoded' job aan
    const job = {
        title: "Help met meubels verhuizen",
        description: "Hulp nodig bij het verhuizen van een zetel en een eettafel van mijn appartement naar een opslagruimte. Zwaar tilwerk vereist. Ongeveer 2-3 uur werk.",
        location: "Hoogstraat, Mechelen",
        date: "Zondag, 25 januari, 2026",
        compensation: "75",
        category: "Verhuizen",
        status: "Open"
    };
    return (
        <AppLayout>
            {/* Stel de paginatitel dynamisch in op basis van de klusnaam */}
            <Head title={`${job?.title || 'Klus Detail'} - FixDirect`} />

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                
                {/* TERUG LINK */}
                {/* Een subtiele knop om terug te keren naar het overzicht. */}
                <Link 
                    href="/jobs" 
                    className="flex items-center text-sm font-medium text-neutral-500 hover:text-orange-600 transition-colors mb-8"
                >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Terug naar klusjes
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* LINKER KOLOM: De hoofdinhoud van de klus */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-neutral-900 rounded-[2rem] p-8 border border-neutral-100 dark:border-neutral-800 shadow-sm">
                            
                            {/* BADGES: Categorie en Status */}
                            <div className="flex justify-between items-center mb-6">
                                <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-none px-4 py-1 rounded-full dark:bg-blue-500/10 dark:text-blue-400">
                                    Verhuizen
                                </Badge>
                                <Badge className="bg-green-50 text-green-600 border-none px-4 py-1 rounded-full dark:bg-green-500/10 dark:text-green-400">
                                    Open
                                </Badge>
                            </div>

                            {/* TITEL */}
                            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-6">
                                Help met meubels verhuizen
                            </h1>

                            {/* DETAILS: Locatie en Datum met icoontjes */}
                            <div className="flex flex-wrap gap-6 text-neutral-500 dark:text-neutral-400 mb-6">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-neutral-400" />
                                    <span>Hoogstraat, Mechelen</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-neutral-400" />
                                    <span>Zondag, 25 januari, 2026</span>
                                </div>
                            </div>

                            {/* PRIJS: Groot en opvallend oranje */}
                            <div className="text-2xl font-bold text-orange-500 mb-8 flex items-center gap-2">
                                💰 €75
                            </div>

                            <hr className="border-neutral-100 dark:border-neutral-800 mb-8" />

                            {/* OMSCHRIJVING */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">Omschrijving</h2>
                                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    Hulp nodig bij het verhuizen van een zetel en een eettafel van mijn appartement naar een opslagruimte. Zwaar tilwerk vereist. Ongeveer 2-3 uur werk.
                                </p>
                            </div>

                            {/* INFO BOX: Wat moet je weten? (Lichtblauwe achtergrond) */}
                            <div className="mt-10 bg-blue-50/50 dark:bg-blue-500/5 rounded-3xl p-6 border border-blue-100/50 dark:border-blue-500/10">
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-4 flex items-center gap-2">
                                    Wat moet je weten?
                                </h3>
                                <ul className="space-y-3">
                                    {/* Elke lijn heeft een blauw vinkje icoontje */}
                                    <li className="flex items-start gap-3 text-neutral-600 dark:text-neutral-400">
                                        <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5" />
                                        <span>Communicatie via een beveiligde chat vóór de ontmoeting.</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-neutral-600 dark:text-neutral-400">
                                        <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5" />
                                        <span>Betaling wordt veilig afgehandeld via het platform.</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-neutral-600 dark:text-neutral-400">
                                        <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5" />
                                        <span>Beoordeel je ervaring na afronding van de taak.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* RECHTER KOLOM: Gebruiker en Acties */}
                    <div className="space-y-6">
                        
                        {/* GEPOST DOOR CARD */}
                        <div className="bg-white dark:bg-neutral-900 rounded-[2rem] p-8 border border-neutral-100 dark:border-neutral-800 shadow-sm">
                            <h2 className="text-xl font-bold mb-6 text-neutral-900 dark:text-neutral-50">Gepost door</h2>
                            
                            {/* Gebruikersprofiel header */}
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-14 w-14 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                    <User size={28} /> {/* Placeholder voor profielfoto */}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-lg">John Doe</span>
                                        <ShieldCheck className="h-4 w-4 text-blue-400" /> {/* Verificatie icoon */}
                                    </div>
                                    <div className="flex items-center text-sm text-neutral-500">
                                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                                        <span className="font-medium text-neutral-900 dark:text-neutral-50 mr-1">4.8</span>
                                        <span>(15 klusjes)</span>
                                    </div>
                                    <div className="text-[10px] text-blue-500 font-bold uppercase tracking-wider mt-1">
                                        ✓ Geverifieerde Klusser
                                    </div>
                                </div>
                            </div>

                            {/* ACTIE KNOPPEN */}
                            <div className="space-y-3">
                                <Button className="w-full h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 font-bold text-white shadow-lg shadow-orange-500/20">
                                    Meld je aan voor klus
                                </Button>
                                <Button variant="outline" className="w-full h-12 rounded-2xl border-neutral-200 dark:border-neutral-800 font-bold">
                                    <MessageSquare className="mr-2 h-4 w-4" /> Stuur bericht
                                </Button>
                            </div>
                        </div>

                        {/* VEILIGHEIDSTIPS CARD */}
                        <div className="bg-blue-50/30 dark:bg-neutral-900/50 rounded-[2rem] p-8 border border-blue-100/20 dark:border-neutral-800">
                            <h2 className="text-lg font-bold mb-6 text-neutral-900 dark:text-neutral-50 font-sans">Veiligheids tips</h2>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                                    <ShieldCheck className="h-5 w-5 text-blue-400 shrink-0" />
                                    <span>Communiceer altijd via het platform</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                                    <ShieldCheck className="h-5 w-5 text-blue-400 shrink-0" />
                                    <span>Ontmoet elkaar op openbare plaatsen</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                                    <ShieldCheck className="h-5 w-5 text-blue-400 shrink-0" />
                                    <span>Vertrouw je instincten</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}