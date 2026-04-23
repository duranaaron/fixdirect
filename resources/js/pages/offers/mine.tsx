import { Head, Link, useForm } from '@inertiajs/react';
import { Calendar, Hammer, MapPin, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ReviewForm from '@/components/review-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Klusje } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Mijn biedingen', href: '/my/offers' }];

type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

interface Offer {
    id: number;
    status: OfferStatus;
    message: string | null;
    proposed_compensation: string | null;
    created_at: string;
    klusje: Klusje;
    review_target?: { id: number; name: string } | null;
}

const statusMeta: Record<OfferStatus, { label: string; className: string }> = {
    pending: { label: 'In behandeling', className: 'bg-blue-50 text-blue-700' },
    accepted: { label: 'Geaccepteerd', className: 'bg-green-50 text-green-700' },
    rejected: { label: 'Afgewezen', className: 'bg-slate-100 text-slate-500' },
    withdrawn: { label: 'Ingetrokken', className: 'bg-slate-100 text-slate-500' },
};

export default function MineOffers({ offers = [] }: { offers?: Offer[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mijn biedingen" />

            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6 md:p-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mijn biedingen</h1>
                    <p className="text-muted-foreground">Klusjes waarop jij je hebt aangemeld.</p>
                </div>

                {offers.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                        <Hammer className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                        <p className="mb-4 text-sm text-slate-500">Je hebt je nog niet aangemeld voor klusjes.</p>
                        <Button asChild>
                            <Link href="/find">Vind klusjes</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {offers.map((offer) => (
                            <OfferRow key={offer.id} offer={offer} />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function OfferRow({ offer }: { offer: Offer }) {
    const meta = statusMeta[offer.status];
    const withdraw = useForm({});
    const [showReview, setShowReview] = useState(false);

    const handleWithdraw = () => {
        if (confirm('Weet je zeker dat je je aanmelding wilt intrekken?')) {
            withdraw.delete(`/offers/${offer.id}`, { preserveScroll: true });
        }
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge className={`${meta.className} rounded-full border-none px-3 py-0.5 text-xs font-semibold`}>
                            {meta.label}
                        </Badge>
                        <Badge className="rounded-full border-none bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-600">
                            {offer.klusje.category}
                        </Badge>
                        <span className="text-xs text-slate-400">
                            aangemeld op {new Date(offer.created_at).toLocaleDateString('nl-BE')}
                        </span>
                    </div>
                    <Link
                        href={`/jobs/${offer.klusje.id}`}
                        className="text-lg font-bold text-slate-900 hover:text-orange-600"
                    >
                        {offer.klusje.title}
                    </Link>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1">
                            <MapPin size={14} /> {offer.klusje.location}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Calendar size={14} /> {new Date(offer.klusje.date).toLocaleDateString('nl-BE')}
                        </span>
                        <span className="font-semibold text-orange-600">€{offer.klusje.compensation}</span>
                    </div>
                    {offer.proposed_compensation &&
                        parseFloat(offer.proposed_compensation) !== parseFloat(offer.klusje.compensation) && (
                            <div className="mt-1 text-sm text-orange-600">
                                Jouw tegenbod: €{offer.proposed_compensation}
                            </div>
                        )}
                    {offer.message && (
                        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{offer.message}</p>
                    )}
                    {offer.review_target && !showReview && (
                        <button
                            onClick={() => setShowReview(true)}
                            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-1.5 text-xs font-semibold text-yellow-800 hover:bg-yellow-100"
                        >
                            <Star size={13} className="fill-yellow-400 text-yellow-400" />
                            Beoordeel {offer.review_target.name}
                        </button>
                    )}
                </div>

                {offer.status === 'pending' && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleWithdraw}
                        disabled={withdraw.processing}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                        <Trash2 size={14} className="mr-1" /> Intrekken
                    </Button>
                )}
            </div>
            {offer.review_target && showReview && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                    <ReviewForm
                        klusjeId={offer.klusje.id}
                        toUserId={offer.review_target.id}
                        toUserName={offer.review_target.name}
                    />
                </div>
            )}
        </div>
    );
}
