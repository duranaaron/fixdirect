import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
// WAT: Iconen importeren van Lucide. WAAROM: Het geeft een professionele look zonder zware afbeeldingen.
import {
    Clock,
    CheckCircle,
    Wallet,
    Calendar as CalendarIcon,
    List,
    Check,
    Wallet2,
    LucideWallet,
    BadgeEuro,
    Gem,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

/**
 * COMPONENT: StatCard
 * WAAROM: We maken een aparte 'functie' voor de kaartjes bovenin omdat ze 3x hetzelfde zijn.
 * Dit heet "DRY" (Don't Repeat Yourself). Verander je hier de kleur, dan verandert het overal.
 */
const StatCard = ({ icon: Icon, title, value, colorClass, iconColor }: any) => (
    // WAT: border-sidebar-border/70. UI-TIP: De /70 maakt de rand 70% transparant voor een subtiele look.
    <div className="flex items-center gap-4 rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm">
        {/* WAT: Dynamische achtergrondkleur via props. WAAROM: Zo krijgt 'Voltooid' groen en 'Binnenkort' blauw. */}
        <div className={`rounded-xl p-3 ${colorClass} ${iconColor}`}>
            <Icon size={24} />
        </div>
        <div>
            {/* WAT: text-muted-foreground. UI-TIP: Dit is een standaard kleur in Shadcn voor grijze, secundaire tekst. */}
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            {/* HOOFDCONTAINER: Gebruikt 'flex-col' om alles netjes onder elkaar te stapelen met een 'gap-8' (ruimte ertussen). */}
            <div className="flex flex-col gap-8 p-6 md:p-8">
                {/* SECTIE 1: HEADER
                    WAT: md:flex-row. 
                    WAAROM: Op mobiel staan titel en knoppen onder elkaar (col), op desktop naast elkaar (row). */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Mijn dashboard
                        </h1>
                        <p className="text-muted-foreground">
                            Beheer jouw bevestigde klusjes en agenda
                        </p>
                    </div>

                    {/* TOGGLE BUTTONS: 'inline-flex' zorgt dat de container precies zo groot is als de knoppen. */}
                    <div className="inline-flex rounded-lg border border-sidebar-border/70 bg-white p-1 shadow-sm">
                        <button className="flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm">
                            <CalendarIcon size={16} /> Kalender
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                            <List size={16} /> Lijst
                        </button>
                    </div>
                </div>

                {/* SECTIE 2: STATISTIEKEN GRID
                    WAT: grid-cols-1 (mobiel) naar md:grid-cols-3 (desktop).
                    WAAROM: Dit verdeelt de beschikbare ruimte in 3 gelijke kolommen. */}
                <div className="grid gap-4 md:grid-cols-3">
                    <StatCard
                        icon={Clock}
                        title="Binnenkort"
                        value="1"
                        colorClass="bg-orange-50"
                        iconColor="text-orange-600"
                    />

                    <StatCard
                        icon={Check}
                        title="Voltooid"
                        value="0"
                        colorClass="bg-green-50"
                        iconColor="text-green-600"
                    />

                    <StatCard
                        icon={Gem}
                        title="Deze maand"
                        value="€10"
                        colorClass="bg-blue-50"
                        iconColor="text-blue-600"
                    />
                </div>

                {/* SECTIE 3: DE KALENDER
                    WAT: Dit is een 'Card' container met witte achtergrond en afgeronde hoeken. */}
                <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm">
                    <header className="mb-8">
                        <h3 className="text-xl font-bold">Januari 2026</h3>
                        <p className="text-sm text-muted-foreground">
                            Jouw bevestigde klusjes deze maand
                        </p>
                    </header>

                    {/* DE KALENDER GRID:
                        WAT: grid-cols-7. 
                        WAAROM: Cruciaal! Elke kolom representeert één dag van de week. */}
                    <div className="grid grid-cols-7 border-b border-sidebar-border/50 pb-4 text-center text-sm font-medium text-muted-foreground">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                            (day) => (
                                <div key={day}>{day}</div>
                            ),
                        )}
                    </div>

                    <div className="grid grid-cols-7 gap-y-4 pt-4">
                        {/* WAT: Offset (Lege ruimte). 
                            UI-TIP: Januari 2026 begint op een donderdag. We slaan 4 kolommen over (Sun-Wed). */}
                        <div className="col-span-4"></div>

                        {/* WAT: Array(31) Loop.
                            WAAROM: In plaats van 31x een div te typen, laten we React het werk doen. */}
                        {[...Array(31)].map((_, i) => {
                            const day = i + 1;
                            const isToday = day === 22; // Hardcoded voor voorbeeld
                            const hasJob = day === 24; // Hardcoded voor voorbeeld

                            return (
                                <div
                                    key={i}
                                    className="flex justify-center py-2"
                                >
                                    {/* WAT: Conditionele Styling (Template Literals).
                                        WAAROM: Hier bepalen we de kleur op basis van de data.
                                        HOE: `isToday ? 'kleur-voor-vandaag' : 'standaard-kleur'` */}
                                    <div
                                        className={`flex h-12 w-12 items-center justify-center rounded-xl text-sm font-semibold transition-all ${isToday ? 'scale-110 bg-blue-500 text-white shadow-lg' : ''} ${hasJob ? 'border-2 border-orange-400 bg-orange-50 text-orange-600' : 'text-foreground hover:bg-zinc-100'} `}
                                    >
                                        {day}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* LEGENDA: Helpt de gebruiker begrijpen wat de kleuren betekenen. */}
                    <div className="mt-8 flex gap-6 border-t border-sidebar-border/50 pt-6">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <div className="h-3 w-3 rounded bg-blue-500"></div>
                            <span>Vandaag</span>
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground"></div>
                            <div className="h-3 w-3 rounded bg-orange-500"></div>
                            <span>Komende taken</span>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
