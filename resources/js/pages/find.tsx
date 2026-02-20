import { Head } from '@inertiajs/react';
import JobCard from '@/components/cards/JobCard';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { find } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Vind klusjes',
        href: find().url,
    },
];

export default function Find() {
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
                <JobCard
                    title="Help met meubels verhuizen"
                    description="Hulp nodig bij het verplaatsen van een bank en
                            eettafel van mijn appartement naar een opslagruimte.
                            Zwaar tillen vereist. Ongeveer 2-3 uur werk."
                    category="Verhuizen"
                    address="Hoogstraat, Mechelen"
                    date="January 25, 2026"
                    compensation="75"
                    poster="Sarah Johnson"
                />
                <JobCard
                    title="Help met meubels verhuizen"
                    description="Hulp nodig bij het verplaatsen van een bank en
                            eettafel van mijn appartement naar een opslagruimte.
                            Zwaar tillen vereist. Ongeveer 2-3 uur werk."
                    category="Verhuizen"
                    address="Hoogstraat, Mechelen"
                    date="January 25, 2026"
                    compensation="75"
                    poster="Sarah Johnson"
                />
                <JobCard
                    title="Help met meubels verhuizen"
                    description="Hulp nodig bij het verplaatsen van een bank en
                            eettafel van mijn appartement naar een opslagruimte.
                            Zwaar tillen vereist. Ongeveer 2-3 uur werk."
                    category="Verhuizen"
                    address="Hoogstraat, Mechelen"
                    date="January 25, 2026"
                    compensation="75"
                    poster="Sarah Johnson"
                />
            </div>
        </AppLayout>
    );
}
