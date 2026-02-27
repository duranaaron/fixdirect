import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    Clock,
    Hammer,
    Leaf,
    Paintbrush,
    Search,
    ShieldCheck,
    Star,
    Truck,
    Wrench,
} from 'lucide-react';
import JobCard from '@/components/cards/JobCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { dashboard, find } from '@/routes';

export default function Home() {
    return (
        <AppLayout breadcrumbs={[]}>
            <Head title="FixDirect - Vind klusjes & hulp">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700,800,900"
                    rel="stylesheet"
                />
            </Head>

            {/* Ambient Animated Blobs */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-orange-400/20 mix-blend-multiply blur-[100px] dark:bg-orange-600/10 dark:mix-blend-screen"></div>
                <div className="absolute top-20 -left-20 h-[500px] w-[500px] rounded-full bg-blue-400/20 mix-blend-multiply blur-[100px] dark:bg-blue-600/10 dark:mix-blend-screen"></div>
            </div>

            <div className="flex flex-col gap-24 pb-24">
                {/* Hero Section */}
                <section className="relative pt-16 md:pt-28 lg:pt-36">
                    <div className="container mx-auto px-4 text-center">
                        {/*<Badge*/}
                        {/*    variant="secondary"*/}
                        {/*    className="mb-8 cursor-pointer rounded-full bg-orange-100 px-5 py-2 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:hover:bg-orange-500/20"*/}
                        {/*>*/}
                        {/*    <span className="mr-2 animate-pulse">✨</span> De*/}
                        {/*    slimste manier om klusjes te fixen*/}
                        {/*</Badge>*/}
                        <h1 className="mx-auto mb-6 max-w-5xl text-5xl font-black tracking-tight text-neutral-900 sm:text-6xl md:text-7xl lg:text-8xl dark:text-neutral-50">
                            Vind de perfecte{' '}
                            <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
                                klushulp
                            </span>{' '}
                            in jouw buurt.
                        </h1>
                        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-neutral-600 sm:text-xl md:text-2xl dark:text-neutral-400">
                            Of je nu hulp nodig hebt met verhuizen, een lekkende
                            kraan, of tuinieren. Plaats je klusje en kom in
                            contact met betrouwbare helpers in jouw omgeving.
                        </p>

                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Button
                                asChild
                                size="lg"
                                className="h-14 w-full rounded-full bg-orange-500 px-8 text-base font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:scale-105 hover:bg-orange-600 sm:w-auto"
                            >
                                <Link href={find()}>
                                    Klusjes bekijken{' '}
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="h-14 w-full rounded-full border-2 border-neutral-200 bg-white px-8 text-base font-semibold transition-all hover:scale-105 sm:w-auto dark:border-neutral-800 dark:bg-neutral-900"
                            >
                                <Link href={dashboard()}>
                                    Plaats een klusje
                                </Link>
                            </Button>
                        </div>

                        {/* Trust indicators */}
                        <div className="mt-20 flex flex-wrap items-center justify-center gap-8 border-y border-neutral-200 py-8 text-sm font-medium text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-green-500" />
                                <span>Geverifieerde gebruikers</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Star
                                    className="h-5 w-5 text-yellow-400"
                                    fill="currentColor"
                                />
                                <span>4.9/5 gemiddelde rating</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-blue-500" />
                                <span>Snelle respons binnen 1 uur</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Hoe het werkt */}
                <section className="container mx-auto px-4">
                    <div className="mx-auto mb-16 max-w-2xl text-center">
                        <h2 className="mb-4 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-neutral-50">
                            Klusjes fixen was nog nooit zo makkelijk
                        </h2>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400">
                            In drie simpele stappen van probleem naar oplossing.
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        {/* Step 1 */}
                        <div className="group relative rounded-3xl bg-white p-8 shadow-sm ring-1 ring-neutral-100 transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-neutral-900/50 dark:ring-neutral-800">
                            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 dark:bg-orange-500/10 dark:text-orange-400">
                                <Search className="h-8 w-8" />
                            </div>
                            <h3 className="mb-3 text-xl font-semibold text-neutral-900 dark:text-neutral-50">
                                1. Plaats je klusje
                            </h3>
                            <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
                                Beschrijf wat er moet gebeuren, voeg foto's toe
                                en bepaal je budget. Het duurt slechts 2
                                minuten.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="group relative rounded-3xl bg-white p-8 shadow-sm ring-1 ring-neutral-100 transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-neutral-900/50 dark:ring-neutral-800">
                            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 dark:bg-blue-500/10 dark:text-blue-400">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <h3 className="mb-3 text-xl font-semibold text-neutral-900 dark:text-neutral-50">
                                2. Kies de beste helper
                            </h3>
                            <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
                                Ontvang reacties van betrouwbare helpers in jouw
                                buurt. Vergelijk profielen en reviews en maak je
                                keuze.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="group relative rounded-3xl bg-white p-8 shadow-sm ring-1 ring-neutral-100 transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-neutral-900/50 dark:ring-neutral-800">
                            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 dark:bg-green-500/10 dark:text-green-400">
                                <Wrench className="h-8 w-8" />
                            </div>
                            <h3 className="mb-3 text-xl font-semibold text-neutral-900 dark:text-neutral-50">
                                3. Klus geklaard
                            </h3>
                            <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
                                De helper voert de klus uit. Betaal veilig
                                achteraf via het platform en laat een review
                                achter.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Populaire categorieën */}
                <section className="container mx-auto px-4">
                    <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
                        <div>
                            <h2 className="mb-3 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                                Wat zoek je?
                            </h2>
                            <p className="text-lg text-neutral-600 dark:text-neutral-400">
                                Populaire categorieën op FixDirect.
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            className="hidden text-orange-600 hover:text-orange-700 md:flex dark:text-orange-400"
                            asChild
                        >
                            <Link href={find()}>
                                Alle categorieën bekijken{' '}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 lg:gap-8">
                        {[
                            {
                                title: 'Verhuizen & Transport',
                                icon: Truck,
                                color: 'text-blue-500',
                                bg: 'bg-blue-50 dark:bg-blue-500/10',
                                border: 'hover:border-blue-200 dark:hover:border-blue-500/30',
                                shadow: 'hover:shadow-blue-100/50 dark:hover:shadow-blue-900/20',
                            },
                            {
                                title: 'Montage & Reparatie',
                                icon: Hammer,
                                color: 'text-orange-500',
                                bg: 'bg-orange-50 dark:bg-orange-500/10',
                                border: 'hover:border-orange-200 dark:hover:border-orange-500/30',
                                shadow: 'hover:shadow-orange-100/50 dark:hover:shadow-orange-900/20',
                            },
                            {
                                title: 'Schilderen',
                                icon: Paintbrush,
                                color: 'text-purple-500',
                                bg: 'bg-purple-50 dark:bg-purple-500/10',
                                border: 'hover:border-purple-200 dark:hover:border-purple-500/30',
                                shadow: 'hover:shadow-purple-100/50 dark:hover:shadow-purple-900/20',
                            },
                            {
                                title: 'Tuinonderhoud',
                                icon: Leaf,
                                color: 'text-green-500',
                                bg: 'bg-green-50 dark:bg-green-500/10',
                                border: 'hover:border-green-200 dark:hover:border-green-500/30',
                                shadow: 'hover:shadow-green-100/50 dark:hover:shadow-green-900/20',
                            },
                        ].map((cat, i) => (
                            <Link
                                href={find()}
                                key={i}
                                className={`group relative flex flex-col items-center justify-center gap-5 rounded-3xl border border-neutral-100 bg-white p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900/50 ${cat.border} ${cat.shadow}`}
                            >
                                <div
                                    className={`flex h-20 w-20 items-center justify-center rounded-2xl ${cat.bg} ${cat.color} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}
                                >
                                    <cat.icon className="h-10 w-10" />
                                </div>
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">
                                    {cat.title}
                                </h3>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Recente klusjes teaser */}
                <section className="container mx-auto px-4">
                    <div className="rounded-[3rem] bg-neutral-50/80 px-4 py-16 md:px-12 lg:py-24 dark:bg-neutral-900/30">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-neutral-50">
                                Lokaal aan de slag
                            </h2>
                            <p className="mx-auto max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
                                Help je buren en verdien direct geld. Bekijk
                                welke klusjes er nu openstaan.
                            </p>
                        </div>

                        <div className="mx-auto flex max-w-6xl flex-col items-center gap-10">
                            <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
                                <div className="flex w-full justify-center">
                                    <JobCard
                                        title="IKEA Kast Monteren (PAX)"
                                        description="Ik zoek iemand met ervaring om een grote PAX kledingkast in elkaar te zetten. Alle onderdelen en handleiding zijn aanwezig, eigen gereedschap is een plus."
                                        category="Montage"
                                        address="Centrum, Antwerpen"
                                        date="Vandaag"
                                        compensation="65"
                                        poster="Michael S."
                                    />
                                </div>
                                <div className="flex w-full justify-center">
                                    <JobCard
                                        title="Tuin winterklaar maken"
                                        description="Onze achtertuin (circa 40m2) heeft wat liefde nodig. Bladeren opruimen, onkruid wieden en de heg lichtjes snoeien. Groenafval kan hier in de gft-bak."
                                        category="Tuinieren"
                                        address="Zuid, Gent"
                                        date="Morgen"
                                        compensation="80"
                                        poster="Emma L."
                                    />
                                </div>
                            </div>
                            <Button
                                asChild
                                size="lg"
                                className="mt-4 h-14 rounded-full px-8 text-base shadow-sm"
                            >
                                <Link href={find()}>
                                    Bekijk nog 124 openstaande klusjes
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Bottom CTA */}
                <section className="container mx-auto px-4">
                    <div className="relative overflow-hidden rounded-[3rem] bg-[#111] px-6 py-20 text-center text-white shadow-2xl sm:px-12 sm:py-28">
                        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500 via-[#111] to-[#111] opacity-30"></div>

                        <div className="relative z-10 flex flex-col items-center">
                            {/*<Badge*/}
                            {/*    variant="secondary"*/}
                            {/*    className="mb-8 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-orange-300 backdrop-blur-md hover:bg-white/20"*/}
                            {/*>*/}
                            {/*    Start vandaag nog*/}
                            {/*</Badge>*/}
                            <h2 className="mx-auto mb-6 max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl">
                                Klaar om de perfecte klus of helper te vinden?
                            </h2>
                            <p className="mx-auto mb-10 max-w-xl text-lg text-neutral-300">
                                Sluit je aan bij duizenden anderen op FixDirect
                                en maak je leven een stukje makkelijker (of
                                verdien wat extra bij).
                            </p>
                            <div className="flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
                                <Button
                                    asChild
                                    size="lg"
                                    className="h-14 w-full rounded-full bg-orange-500 px-10 text-base font-bold text-white transition-all hover:scale-105 hover:bg-orange-600 sm:w-auto"
                                >
                                    <Link href={dashboard()}>
                                        Maak een gratis account
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="lg"
                                    variant="ghost"
                                    className="h-14 w-full rounded-full border border-white/20 bg-transparent px-10 text-base font-bold text-white transition-all hover:bg-white/10 hover:text-white sm:w-auto"
                                >
                                    <Link href={find()}>
                                        Ontdek de mogelijkheden
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
