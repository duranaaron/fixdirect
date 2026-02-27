import {
    Calendar,
    CheckCircle2,
    ChevronLeft,
    Euro,
    MapPin,
    MessageSquare,
    Shield,
    ShieldCheck,
    User,
} from 'lucide-react';

const JobDetail = () => {
    return (
        /* De wrapper van de hele pagina.
      min-h-screen zorgt dat de achtergrondkleur altijd de hele pagina vult.
      bg-gray-50 is de hele lichte grijze achtergrond uit je screenshot.
    */
        <div className="min-h-screen bg-gray-50 font-sans text-slate-900">
            {/* NAVBAR
        sticky top-0 zorgt dat de balk blijft staan tijdens het scrollen.
        z-50 zorgt dat hij bovenop andere elementen ligt.
      */}
            <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white px-4 py-3">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    {/* Logo Sectie */}
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-[#3b82f6] p-1.5 text-xl font-bold text-white">
                            FD
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-[#1e293b]">
                            FixDirect
                        </span>
                    </div>

                    {/* Navigatie Links - hidden op mobiel, flex op grotere schermen */}
                    <div className="hidden items-center gap-8 font-medium text-gray-600 md:flex">
                        <a href="#" className="flex items-center gap-2">
                            <span className="p-1">🏠</span> Home
                        </a>
                        <a
                            href="#"
                            className="flex items-center gap-2 border-b-2 border-transparent font-semibold text-gray-900 hover:border-blue-500"
                        >
                            <span className="p-1">📋</span> Vind klusjes
                        </a>
                        <a href="#" className="flex items-center gap-2">
                            <span className="p-1">📅</span> Mijn dashboard
                        </a>
                    </div>

                    {/* Actie knoppen aan de rechterkant */}
                    <div className="flex items-center gap-4">
                        <button className="rounded-full bg-[#ff8a00] px-6 py-2.5 font-bold text-white transition-colors hover:bg-[#e67e00]">
                            + Post klusje
                        </button>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-400">
                            <User size={20} />
                        </div>
                    </div>
                </div>
            </nav>

            {/* HOOFD CONTENT */}
            <main className="mx-auto max-w-6xl px-4 py-8">
                {/* 'Terug' link */}
                <button className="mb-8 flex items-center gap-1 font-medium text-[#3b82f6] hover:underline">
                    <ChevronLeft size={20} />
                    Terug naar klusjes
                </button>

                {/* GRID LAYOUT
          Op mobiel (standaard) 1 kolom.
          Op 'lg' schermen (vanaf 1024px) 12 kolommen voor meer controle.
        */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* LINKER KOLOM (Klus details) - neemt 8 van de 12 kolommen in */}
                    <div className="lg:col-span-8">
                        <div className="rounded-[2rem] border border-gray-200 bg-white p-10 shadow-sm">
                            {/* Badges bovenin */}
                            <div className="mb-6 flex items-center justify-between">
                                <span className="rounded-full bg-[#eff6ff] px-5 py-2 text-sm font-semibold text-[#3b82f6]">
                                    Verhuizen
                                </span>
                                <span className="rounded-full bg-[#f0fdf4] px-4 py-1.5 text-sm font-semibold text-[#22c55e]">
                                    Open
                                </span>
                            </div>

                            {/* Titel */}
                            <h1 className="mb-8 text-4xl font-extrabold text-[#1e293b]">
                                Help met meubels verhuizen
                            </h1>

                            {/* Info icons sectie */}
                            <div className="mb-10 space-y-4">
                                <div className="flex items-center gap-3 text-gray-500">
                                    <MapPin
                                        size={22}
                                        className="text-gray-400"
                                    />
                                    <span className="text-lg">
                                        Hoogstraat, Mechelen
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-500">
                                    <Calendar
                                        size={22}
                                        className="text-gray-400"
                                    />
                                    <span className="text-lg">
                                        Zondag, 25 januari, 2026
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-2xl font-bold text-[#ff8a00]">
                                    <Euro size={24} />
                                    <span>€75</span>
                                </div>
                            </div>

                            {/* Divider lijn */}
                            <hr className="mb-10 border-gray-100" />

                            {/* Beschrijving */}
                            <div className="mb-10">
                                <h3 className="mb-4 text-xl font-bold text-[#1e293b]">
                                    Omschrijving
                                </h3>
                                <p className="text-lg leading-relaxed text-gray-600">
                                    Hulp nodig bij het verhuizen van een zetel
                                    en een eettafel van mijn appartement naar
                                    een opslagruimte. Zwaar tilwerk vereist.
                                    Ongeveer 2–3 uur werk.
                                </p>
                            </div>

                            {/* Blauwe Info Box */}
                            <div className="rounded-2xl border border-[#eef2ff] bg-[#f8fbff] p-8">
                                <h4 className="mb-6 text-lg font-bold">
                                    Wat moet je weten?
                                </h4>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3 text-gray-600">
                                        <CheckCircle2
                                            size={22}
                                            className="mt-0.5 shrink-0 text-[#3b82f6]"
                                        />
                                        <span>
                                            Communicatie via een beveiligde chat
                                            vóór de ontmoeting.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3 text-gray-600">
                                        <CheckCircle2
                                            size={22}
                                            className="mt-0.5 shrink-0 text-[#3b82f6]"
                                        />
                                        <span>
                                            Betaling wordt veilig afgehandeld
                                            via het platform.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3 text-gray-600">
                                        <CheckCircle2
                                            size={22}
                                            className="mt-0.5 shrink-0 text-[#3b82f6]"
                                        />
                                        <span>
                                            Beoordeel je ervaring na afronding
                                            van de taak.
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* RECHTER KOLOM (Sidebar) - neemt 4 van de 12 kolommen in */}
                    <div className="space-y-6 lg:col-span-4">
                        {/* Poster Kaart */}
                        <div className="rounded-[2rem] border border-gray-200 bg-white p-8 text-center shadow-sm sm:text-left">
                            <h3 className="mb-6 text-xl font-bold">
                                Gepost door
                            </h3>

                            <div className="mb-8 flex items-center gap-4">
                                {/* Gebruiker Avatar */}
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#3b82f6] text-white shadow-lg shadow-blue-100">
                                    <User size={32} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 text-lg font-bold">
                                        John Doe{' '}
                                        <ShieldCheck
                                            size={18}
                                            className="text-[#3b82f6]"
                                        />
                                    </div>
                                    <div className="text-gray-500">
                                        <span className="font-bold text-[#ff8a00]">
                                            ★ 4.8
                                        </span>
                                        <span className="ml-1 text-sm">
                                            (15 klusjes)
                                        </span>
                                    </div>
                                    <div className="mt-1 text-xs font-semibold text-[#3b82f6]">
                                        ✓ Geverifieerde Klusser
                                    </div>
                                </div>
                            </div>

                            {/* Call-to-actions */}
                            <button className="mb-4 w-full rounded-2xl bg-[#ff8a00] py-4 font-bold text-white shadow-md shadow-orange-100 transition-all hover:bg-[#e67e00] active:scale-95">
                                Meld je aan voor klus
                            </button>
                            <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-4 font-bold text-gray-800 transition-all hover:bg-gray-50 active:scale-95">
                                <MessageSquare size={20} />
                                Stuur bericht
                            </button>
                        </div>

                        {/* Veiligheidstips Kaart */}
                        <div className="rounded-[2rem] border border-[#eef2ff] bg-[#f8fbff] p-8">
                            <h3 className="mb-6 text-xl font-bold">
                                Veiligheids tips
                            </h3>
                            <ul className="space-y-6">
                                <li className="flex gap-4">
                                    <Shield
                                        size={24}
                                        className="shrink-0 text-[#3b82f6]"
                                    />
                                    <span className="text-sm leading-relaxed text-gray-600">
                                        Communiceer altijd via het platform
                                    </span>
                                </li>
                                <li className="flex gap-4">
                                    <Shield
                                        size={24}
                                        className="shrink-0 text-[#3b82f6]"
                                    />
                                    <span className="text-sm leading-relaxed text-gray-600">
                                        Ontmoet elkaar op openbare plaatsen
                                    </span>
                                </li>
                                <li className="flex gap-4">
                                    <Shield
                                        size={24}
                                        className="shrink-0 text-[#3b82f6]"
                                    />
                                    <span className="text-sm leading-relaxed text-gray-600">
                                        Vertrouw je instincten
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default JobDetail;
