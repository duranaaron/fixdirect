import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft, Check, X, User as UserIcon, ArrowLeftRight } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Klusje, User } from '@/types';

type OfferStatus = 'pending' | 'counter_offered' | 'accepted' | 'rejected' | 'withdrawn';

interface Offer {
    id: number;
    status: OfferStatus;
    message: string | null;
    proposed_compensation: string | null;
    counter_offer_compensation: string | null;
    counter_offer_message: string | null;
    created_at: string;
    klusser: User;
}

const statusMeta: Record<OfferStatus, { label: string; className: string }> = {
    pending: { label: 'In behandeling', className: 'bg-blue-50 text-blue-700' },
    counter_offered: { label: 'Terugbod gedaan', className: 'bg-orange-50 text-orange-700' },
    accepted: { label: 'Geaccepteerd', className: 'bg-green-50 text-green-700' },
    rejected: { label: 'Afgewezen', className: 'bg-slate-100 text-slate-500' },
    withdrawn: { label: 'Ingetrokken', className: 'bg-slate-100 text-slate-500' },
};

export default function KlusjeOffers({ klusje, offers }: { klusje: Klusje; offers: Offer[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Mijn klusjes', href: '/my/klusjes' },
        { title: klusje.title, href: `/jobs/${klusje.id}` },
        { title: 'Aanmeldingen', href: `/jobs/${klusje.id}/offers` },
    ];

    const hasAccepted = offers.some((o) => o.status === 'accepted');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Aanmeldingen - ${klusje.title}`} />

            <div className="mx-auto w-full max-w-4xl p-6 md:p-8">
                <Link
                    href={`/jobs/${klusje.id}`}
                    className="mb-6 inline-flex items-center text-sm font-medium text-neutral-500 hover:text-orange-600"
                >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Terug naar klus
                </Link>

                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Aanmeldingen</h1>
                    <p className="text-muted-foreground">voor &ldquo;{klusje.title}&rdquo;</p>
                </div>

                {offers.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                        <UserIcon className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                        <p className="text-sm text-slate-500">Er zijn nog geen aanmeldingen voor deze klus.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {offers.map((offer) => (
                            <OfferRow
                                key={offer.id}
                                offer={offer}
                                klusjeCompensation={klusje.compensation}
                                hasAccepted={hasAccepted}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function OfferRow({
    offer,
    klusjeCompensation,
    hasAccepted,
}: {
    offer: Offer;
    klusjeCompensation: string;
    hasAccepted: boolean;
}) {
    const accept = useForm({});
    const reject = useForm({});
    const counter = useForm({
        counter_offer_compensation: offer.proposed_compensation ?? klusjeCompensation,
        counter_offer_message: '',
    });
    const [showCounterForm, setShowCounterForm] = useState(false);

    const meta = statusMeta[offer.status];

    const handleAccept = () => {
        if (confirm(`Weet je zeker dat je ${offer.klusser.name} wilt accepteren? Andere aanmeldingen worden automatisch afgewezen.`)) {
            accept.post(`/offers/${offer.id}/accept`, { preserveScroll: true });
        }
    };

    const handleReject = () => {
        if (confirm(`Aanmelding van ${offer.klusser.name} afwijzen?`)) {
            reject.post(`/offers/${offer.id}/reject`, { preserveScroll: true });
        }
    };

    const handleCounter = (e: React.FormEvent) => {
        e.preventDefault();
        counter.post(`/offers/${offer.id}/counter`, {
            preserveScroll: true,
            onSuccess: () => setShowCounterForm(false),
        });
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge className={`${meta.className} rounded-full border-none px-3 py-0.5 text-xs font-semibold`}>
                            {meta.label}
                        </Badge>
                        <span className="text-xs text-slate-400">
                            {new Date(offer.created_at).toLocaleDateString('nl-BE')}
                        </span>
                    </div>
                    <div className="mb-2 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <UserIcon size={18} />
                        </div>
                        <div>
                            <div className="font-bold text-slate-900">{offer.klusser.name}</div>
                            {offer.proposed_compensation &&
                                parseFloat(offer.proposed_compensation) !== parseFloat(klusjeCompensation) && (
                                    <div className="text-xs text-orange-600">
                                        Bod klusser: €{offer.proposed_compensation}
                                    </div>
                                )}
                        </div>
                    </div>
                    {offer.message && (
                        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{offer.message}</p>
                    )}
                    {offer.status === 'counter_offered' && offer.counter_offer_compensation && (
                        <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
                            <p className="text-xs font-semibold text-orange-700">Jouw terugbod</p>
                            <p className="text-sm font-bold text-orange-900">€{offer.counter_offer_compensation}</p>
                            {offer.counter_offer_message && (
                                <p className="mt-1 text-xs text-orange-700">{offer.counter_offer_message}</p>
                            )}
                            <p className="mt-1 text-xs text-orange-500">Wacht op reactie van {offer.klusser.name}…</p>
                        </div>
                    )}
                </div>

                {offer.status === 'pending' && !hasAccepted && (
                    <div className="flex flex-wrap gap-2">
                        <Button
                            size="sm"
                            onClick={handleAccept}
                            disabled={accept.processing}
                            className="bg-green-500 hover:bg-green-600"
                        >
                            <Check size={14} className="mr-1" /> Accepteer
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowCounterForm((v) => !v)}
                            className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                        >
                            <ArrowLeftRight size={14} className="mr-1" /> Terugbod
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleReject}
                            disabled={reject.processing}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                            <X size={14} className="mr-1" /> Afwijzen
                        </Button>
                    </div>
                )}
            </div>

            {showCounterForm && offer.status === 'pending' && (
                <form onSubmit={handleCounter} className="mt-4 border-t border-slate-100 pt-4">
                    <p className="mb-3 text-sm font-semibold text-slate-700">Terugbod doen aan {offer.klusser.name}</p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="flex-1">
                            <label className="mb-1 block text-xs font-medium text-slate-600">
                                Jouw bedrag (€)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="99999.99"
                                step="0.01"
                                value={counter.data.counter_offer_compensation}
                                onChange={(e) => counter.setData('counter_offer_compensation', e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                                required
                            />
                            {counter.errors.counter_offer_compensation && (
                                <p className="mt-1 text-xs text-red-600">{counter.errors.counter_offer_compensation}</p>
                            )}
                        </div>
                        <div className="flex-[2]">
                            <label className="mb-1 block text-xs font-medium text-slate-600">
                                Bericht (optioneel)
                            </label>
                            <input
                                type="text"
                                maxLength={2000}
                                value={counter.data.counter_offer_message}
                                onChange={(e) => counter.setData('counter_offer_message', e.target.value)}
                                placeholder="Bijv. reden voor ander bedrag…"
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                size="sm"
                                disabled={counter.processing}
                                className="bg-orange-500 hover:bg-orange-600"
                            >
                                Verstuur
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setShowCounterForm(false)}
                            >
                                Annuleer
                            </Button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}
