import { Head, Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import JobCard from '@/components/cards/JobCard';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { find } from '@/routes';
import type { BreadcrumbItem, Klusje, KlusjeImage } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Vind klusjes', href: find().url }];

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Paginated<T> {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

interface FindProps {
    klusjes: Paginated<Klusje>;
    categories: string[];
    filters: {
        category: string;
        location: string;
        search: string;
    };
}

export default function Find({ klusjes, categories = [], filters }: FindProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search ?? '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [selectedLocation, setSelectedLocation] = useState(filters.location || '');

    const applyFilters = () => {
        router.get(
            find().url,
            {
                search: searchQuery || undefined,
                category: selectedCategory !== 'all' ? selectedCategory : undefined,
                location: selectedLocation || undefined,
            },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedCategory('all');
        setSelectedLocation('');
        router.get(find().url, {}, { preserveScroll: true, replace: true });
    };

    const hasActiveFilters =
        (filters.search ?? '') !== '' || (filters.category ?? '') !== '' || (filters.location ?? '') !== '';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vind klusjes" />

            <div className="mt-5">
                <Heading
                    title="Vind klusjes in de buurt"
                    description={`${klusjes.total} ${klusjes.total === 1 ? 'klus' : 'klusjes'} beschikbaar — help je buren en verdien geld.`}
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
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
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

                    <Input
                        type="text"
                        placeholder="Locatie"
                        className="w-full sm:w-[180px]"
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                    />

                    <Button onClick={applyFilters}>Filter</Button>

                    {hasActiveFilters && (
                        <Button variant="ghost" onClick={resetFilters} className="px-2">
                            Reset
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {klusjes.data.length > 0 ? (
                    klusjes.data.map((klusje) => {
                        const primaryImage =
                            klusje.images?.find((img: KlusjeImage) => img.is_primary) || klusje.images?.[0];
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

            {klusjes.last_page > 1 && (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-1">
                    {klusjes.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url ?? '#'}
                            preserveScroll
                            preserveState
                            className={`min-w-[40px] rounded-lg px-3 py-1.5 text-sm transition-colors ${
                                link.active
                                    ? 'bg-slate-900 text-white'
                                    : link.url
                                      ? 'bg-white text-slate-700 hover:bg-slate-100'
                                      : 'cursor-not-allowed text-slate-300'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
