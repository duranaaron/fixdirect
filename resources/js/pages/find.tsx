import { Head } from '@inertiajs/react';
import { Search, Hammer } from 'lucide-react'; // Voeg Hammer toe voor de fallback
import { useState, useMemo } from 'react';
import JobCard from '@/components/cards/JobCard';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { find } from '@/routes';
import type { BreadcrumbItem, Klusje, KlusjeImage } from '@/types'; // Zorg dat KlusjeImage hier ook bij staat

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Vind klusjes',
        href: find().url,
    },
];

export default function Find({ klusjes = [] }: { klusjes?: Klusje[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedLocation, setSelectedLocation] = useState<string>('all');

    // Filter logica (Zorg dat deze variabelen BINNEN de Find functie staan)
    const categories = useMemo(() => {
        const cats = klusjes.map((k) => k.category).filter(Boolean);
        return Array.from(new Set(cats)).sort();
    }, [klusjes]);

    const locations = useMemo(() => {
        const locs = klusjes.map((k) => k.location).filter(Boolean);
        return Array.from(new Set(locs)).sort();
    }, [klusjes]);

    const filteredKlusjes = useMemo(() => {
        return klusjes.filter((klusje) => {
            const matchesSearch =
                klusje.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (klusje.description && klusje.description.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCategory = selectedCategory !== 'all' ? klusje.category === selectedCategory : true;
            const matchesLocation = selectedLocation !== 'all' ? klusje.location === selectedLocation : true;

            return matchesSearch && matchesCategory && matchesLocation;
        });
    }, [klusjes, searchQuery, selectedCategory, selectedLocation]);

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedCategory('all');
        setSelectedLocation('all');
    };

    const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'all' || selectedLocation !== 'all';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vind klusjes" />

            <div className="mt-5">
                <Heading
                    title="Vind klusjes in de buurt"
                    description="Bekijk beschikbare taken en begin vandaag nog je buren te helpen."
                />
            </div>

            <div className="my-6 flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-neutral-400" />
                    </div>
                    <Input
                        type="text"
                        placeholder="Zoeken op titel of beschrijving..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-4 sm:flex-row md:w-auto">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Categorie" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Alle categorieën</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {cat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Locatie" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Alle locaties</SelectItem>
                            {locations.map((loc) => (
                                <SelectItem key={loc} value={loc}>
                                    {loc}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                        <Button variant="ghost" onClick={resetFilters} className="px-2">
                            Reset
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {filteredKlusjes.length > 0 ? (
                    filteredKlusjes.map((klusje: Klusje) => {
                        // Logica voor de foto
                        const primaryImage = klusje.images?.find((img: KlusjeImage) => img.is_primary) || klusje.images?.[0];
                        const imagePath = primaryImage ? `/storage/${primaryImage.image_path}` : null;

                        return (
                            <JobCard
                                key={klusje.id}
                                id={klusje.id}
                                title={klusje.title}
                                description={klusje.description}
                                category={klusje.category}
                                address={klusje.location}
                                date={new Date(klusje.date).toLocaleDateString('nl-BE')}
                                compensation={klusje.compensation}
                                poster={klusje.user?.name ?? 'Onbekend'}
                                image={imagePath}
                            />
                        );
                    })
                ) : (
                    <div className="col-span-full py-16 text-center">
                        <p className="text-lg text-neutral-500">
                            {hasActiveFilters
                                ? 'Geen klusjes gevonden die aan je criteria voldoen.'
                                : 'Er zijn nog geen klusjes geplaatst. Wees de eerste!'}
                        </p>
                        {hasActiveFilters && (
                            <Button variant="outline" className="mt-4" onClick={resetFilters}>
                                Wis filters
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}