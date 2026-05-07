import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { ShieldCheck, LoaderCircle, ArrowLeft, Wallet } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';

// HET FORMULIER COMPONENT
const CheckoutForm = ({ amount }: { amount: number }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;
        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.origin + '/checkout/success',
            },
        });

        if (error.type === 'card_error' || error.type === 'validation_error') {
            setMessage(error.message || 'Er is een fout opgetreden.');
        } else {
            setMessage('Er is een onverwachte fout opgetreden.');
        }
        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <PaymentElement />
            
            {message && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
                    {message}
                </div>
            )}

            <Button
                disabled={isLoading || !stripe || !elements}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 font-black text-white text-lg shadow-lg shadow-orange-500/30 transition-all active:scale-[0.98]"
            >
                {isLoading ? <LoaderCircle className="mr-2 h-6 w-6 animate-spin" /> : null}
                Betaal €{Number(amount).toFixed(2).replace('.', ',')}
            </Button>
        </form>
    );
};

// DE HOOFDPAGINA
export default function CheckoutPage({ clientSecret, stripeKey, proposal, amount, isTopup }: any) {
    const stripePromise = loadStripe(stripeKey);

    const appearance = {
        theme: 'stripe' as const,
        variables: {
            colorPrimary: '#f97316',
            colorBackground: '#ffffff',
            colorText: '#171717',
            colorDanger: '#ef4444',
            fontFamily: 'system-ui, sans-serif',
            borderRadius: '16px',
        },
    };

    // Bepaal welk bedrag we tonen
    const displayAmount = isTopup ? amount : proposal?.amount;

    return (
        <AppLayout>
            <Head title="Veilig afrekenen" />

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <button 
                    onClick={() => window.history.back()}
                    className="flex items-center text-sm font-medium text-neutral-500 hover:text-orange-600 transition-colors mb-8"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" /> Ga terug
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    
                    {/* LINKER KOLOM: Samenvatting */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-black text-neutral-900">Afrekenen</h1>
                            <p className="text-neutral-500 mt-2 font-medium">Voltooi je betaling via onze veilige partner Stripe.</p>
                        </div>

                        <div className="bg-white rounded-[2rem] p-8 border border-neutral-100 shadow-sm">
                            <h2 className="text-xl font-bold text-neutral-900 mb-6">Overzicht</h2>
                            
                            <div className="space-y-4 mb-6 pb-6 border-b border-neutral-100">
                                {isTopup ? (
                                    // Overzicht voor Balans Opwaarderen
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-neutral-600 font-medium">
                                            <Wallet className="h-5 w-5 text-orange-500" />
                                            Balans opwaarderen
                                        </div>
                                        <span className="font-bold text-neutral-900 text-right">Eigen account</span>
                                    </div>
                                ) : (
                                    // Overzicht voor een specifiek Klusje
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-neutral-500">Klusje</span>
                                            <span className="font-bold text-neutral-900 text-right">{proposal?.conversation?.klusje?.title}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-neutral-500">Fixer</span>
                                            <span className="font-bold text-neutral-900">{proposal?.conversation?.starter?.name || 'De doener'}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex justify-between items-center text-xl font-black text-neutral-900">
                                <span>Totaal</span>
                                <span className="text-orange-500">€{Number(displayAmount).toFixed(2).replace('.', ',')}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm font-medium text-neutral-500">
                            <ShieldCheck className="h-5 w-5 text-green-500" />
                            <span>Je betaling wordt veilig verwerkt door Stripe.</span>
                        </div>
                    </div>

                    {/* RECHTER KOLOM: Het Stripe Formulier */}
                    <div>
                        <div className="bg-white rounded-[2rem] p-8 border border-neutral-100 shadow-sm sticky top-24">
                            {clientSecret ? (
                                <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
                                    <CheckoutForm amount={displayAmount} />
                                </Elements>
                            ) : (
                                <div className="flex justify-center py-12">
                                    <LoaderCircle className="h-8 w-8 animate-spin text-orange-500" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}