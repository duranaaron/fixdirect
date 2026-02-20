import { Head } from '@inertiajs/react';
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
            <h1 className="font-bold text-2xl">Vind klusjes in de buurt</h1>

        </AppLayout>
    );
}
