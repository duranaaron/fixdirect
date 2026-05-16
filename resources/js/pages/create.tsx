import { Head } from '@inertiajs/react';
import KlusjeForm from '@/components/klusje-form';
import AppLayout from '@/layouts/app-layout';

export default function CreateJob() {
    return (
        <AppLayout>
            <Head title="Nieuwe klus plaatsen - FixDirect" />
            <KlusjeForm mode="create" />
        </AppLayout>
    );
}

// frontend ui
// titel moet aangepast worden, evt iconen weghalen of aanpassen.