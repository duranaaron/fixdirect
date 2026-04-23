import { Head } from '@inertiajs/react';
import KlusjeForm from '@/components/klusje-form';
import AppLayout from '@/layouts/app-layout';
import type { Klusje } from '@/types';

export default function EditKlusje({ klusje }: { klusje: Klusje }) {
    return (
        <AppLayout>
            <Head title={`${klusje.title} bewerken - FixDirect`} />
            <KlusjeForm
                mode="edit"
                klusjeId={klusje.id}
                initial={{
                    title: klusje.title,
                    category: klusje.category,
                    location: klusje.location,
                    date: String(klusje.date).slice(0, 10),
                    compensation: String(klusje.compensation),
                    description: klusje.description ?? '',
                    images: klusje.images ?? [],
                }}
            />
        </AppLayout>
    );
}
