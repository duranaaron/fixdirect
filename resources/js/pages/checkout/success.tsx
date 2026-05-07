import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

export default function CheckoutSuccess() {
    return (
        <AppLayout>
            <Head title="Betaling Gelukt!" />

            <div className="container mx-auto px-4 py-24 flex flex-col items-center text-center max-w-xl">
                <div className="h-24 w-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-8 shadow-lg shadow-green-500/20">
                    <CheckCircle2 className="h-12 w-12" />
                </div>
                
                <h1 className="text-4xl font-black text-neutral-900 mb-4">Opwaardering Gelukt!</h1>
                <p className="text-lg text-neutral-500 mb-10 font-medium">
                    Bedankt voor je betaling. Je nieuwe balans is bijgewerkt en direct beschikbaar op je account.
                </p>

                <Link 
                    href="/my/balance"
                    className="inline-flex items-center justify-center h-14 px-8 rounded-2xl bg-neutral-900 text-white font-bold hover:bg-neutral-800 transition-all active:scale-95"
                >
                    Terug naar mijn balans <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
            </div>
        </AppLayout>
    );
}