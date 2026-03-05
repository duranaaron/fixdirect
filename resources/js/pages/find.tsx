import { Head } from '@inertiajs/react';
import JobCard from '@/components/cards/JobCard';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { find } from '@/routes';
import type { BreadcrumbItem, Klusje } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Vind klusjes',
        href: find().url,
    },
];

export default function Find({ klusjes = [] }: { klusjes?: Klusje[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vind klusjes" />

            <div className="mt-5">
                <Heading
                    title="Vind klusjes in de buurt"
                    description="Bekijk beschikbare taken en begin vandaag nog je buren te helpen."
                />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {klusjes.length > 0 ? (
                    klusjes.map((klusje) => (
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
                        />
                    ))
                ) : (
                    <div className="col-span-full py-16 text-center">
                        <p className="text-lg text-neutral-500">
                            Er zijn nog geen klusjes geplaatst. Wees de eerste!
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
