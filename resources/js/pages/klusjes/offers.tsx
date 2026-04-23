import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft, Check, X, User as UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Klusje, User } from '@/types';

type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

interface Offer {
    id: number;
    status: OfferStatus;
    message: string | null;
    proposed_compensation: string | null;
    created_at: string;
    klusser: User;
}

const statusMeta: Record<OfferStatus, { label: string; className: string }> = {
    pending: { label: 'In behandeling', className: 'bg-blue-50 text-blue-700' },
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
                                        Tegenbod: €{offer.proposed_compensation}
                                    </div>
                                )}
                        </div>
                    </div>
                    {offer.message && (
                        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{offer.message}</p>
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
                            onClick={handleReject}
                            disabled={reject.processing}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                            <X size={14} className="mr-1" /> Afwijzen
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
