import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    MapPin,
    Calendar,
    ChevronLeft,
    MessageSquare,
    ShieldCheck,
    User,
    CheckCircle2,
    Hammer,
    ClipboardList,
    Pencil,
} from 'lucide-react';
import { CreditCard, Star } from 'lucide-react';
import { useState } from 'react';
import OfferDialog from '@/components/offer-dialog';
import ReviewForm from '@/components/review-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { Klusje } from '@/types';

interface OfferSummary {
    id: number;
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
}

interface ReviewSummary {
    id: number;
    rating: number;
    comment: string | null;
    created_at: string;
    from_user: { id: number; name: string };
}

interface JobDetailProps {
    klusje: Klusje & { offers_count?: number; reviews?: ReviewSummary[] };
    viewerOffer?: OfferSummary | null;
    offerCount?: number;
    canReviewTarget?: { id: number; name: string } | null;
}

const statusLabels: Record<string, { label: string; className: string }> = {
    open: { label: 'Open', className: 'bg-green-50 text-green-600' },
    assigned: { label: 'Toegewezen', className: 'bg-amber-50 text-amber-700' },
    in_progress: { label: 'Bezig', className: 'bg-purple-50 text-purple-700' },
    completed: { label: 'Voltooid', className: 'bg-neutral-100 text-neutral-600' },
    cancelled: { label: 'Geannuleerd', className: 'bg-neutral-100 text-neutral-500' },
};

export default function JobDetail({
    klusje,
    viewerOffer = null,
    offerCount = 0,
    canReviewTarget = null,
}: JobDetailProps) {
    const { auth } = usePage().props as unknown as { auth: { user: { id: number } | null } };
    const conversation = useForm({ klusje_id: klusje.id });
    const [offerDialogOpen, setOfferDialogOpen] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const isOwner = !!auth.user && auth.user.id === klusje.user_id;
    const canApply = !!auth.user && !isOwner && klusje.status === 'open' && !viewerOffer;
    const statusBadge = statusLabels[klusje.status] ?? statusLabels.open;

    const handleStuurBericht = () => {
        if (!auth.user) {
            window.location.href = '/login';
            return;
        }
        conversation.post('/conversations');
    };

    const handleMeldJeAan = () => {
        if (!auth.user) {
            window.location.href = '/login';
            return;
        }
        setOfferDialogOpen(true);
    };

    return (
        <AppLayout>
            <Head title={`${klusje?.title || 'Klus Detail'} - FixDirect`} />

            <div className="container mx-auto max-w-6xl px-4 py-8">
                <Link
                    href="/find"
                    className="mb-8 flex items-center text-sm font-medium text-neutral-500 transition-colors hover:text-orange-600"
                >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Terug naar klusjes
                </Link>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <div className="overflow-hidden rounded-[2rem] border border-neutral-100 bg-white p-8 shadow-sm">
                            {klusje.images && klusje.images.length > 0 ? (
                                <div className="-mx-8 -mt-8 mb-8 space-y-3">
                                    <div className="h-[450px] w-full overflow-hidden bg-neutral-100">
                                        <img
                                            src={`/storage/${klusje.images[activeImageIndex].image_path}`}
                                            alt={klusje.title}
                                            className="h-full w-full object-cover transition-all duration-500"
                                        />
                                    </div>

                                    {klusje.images.length > 1 && (
                                        <div className="scrollbar-hide flex gap-3 overflow-x-auto px-8 pb-2">
                                            {klusje.images.map((img, index) => (
                                                <button
                                                    key={img.id}
                                                    onClick={() => setActiveImageIndex(index)}
                                                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all
                                                        ${activeImageIndex === index ? 'border-orange-500 ring-4 ring-orange-50' : 'border-transparent hover:border-neutral-300'}`}
                                                >
                                                    <img src={`/storage/${img.image_path}`} className="h-full w-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="-mx-8 -mt-8 mb-8 flex h-64 flex-col items-center justify-center border-b border-neutral-100 bg-neutral-50 text-neutral-400">
                                    <Hammer className="mb-2 h-12 w-12 opacity-20" />
                                    <p className="text-sm">Geen foto's beschikbaar voor deze klus</p>
                                </div>
                            )}

                            <div className="mb-6 flex items-center justify-between">
                                <Badge className="rounded-full border-none bg-blue-50 px-4 py-1 text-blue-600 hover:bg-blue-100">
                                    {klusje.category}
                                </Badge>
                                <Badge className={`rounded-full border-none px-4 py-1 ${statusBadge.className}`}>
                                    {statusBadge.label}
                                </Badge>
                            </div>

                            <h1 className="mb-6 text-3xl font-bold text-neutral-900">{klusje.title}</h1>

                            <div className="mb-6 flex flex-wrap gap-6 text-neutral-500">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-neutral-400" />
                                    <span>{klusje.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-neutral-400" />
                                    <span>
                                        {new Date(klusje.date).toLocaleDateString('nl-BE', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-8 flex items-center gap-2 text-2xl font-bold text-orange-500">
                                💰 €{klusje.compensation}
                            </div>

                            <hr className="mb-8 border-neutral-100" />

                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-neutral-900">Omschrijving</h2>
                                <p className="leading-relaxed text-neutral-600">{klusje.description}</p>
                            </div>

                            <div className="mt-10 rounded-3xl border border-blue-100/50 bg-blue-50/50 p-6">
                                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-neutral-900">
                                    Wat moet je weten?
                                </h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3 text-neutral-600">
                                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-blue-500" />
                                        <span>Communicatie via een beveiligde chat vóór de ontmoeting.</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-neutral-600">
                                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-blue-500" />
                                        <span>Betaling wordt veilig afgehandeld via het platform.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-[2rem] border border-neutral-100 bg-white p-8 shadow-sm">
                            <h2 className="mb-6 text-xl font-bold text-neutral-900">Gepost door</h2>

                            <div className="mb-8 flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-blue-50 bg-blue-500 text-white">
                                    {klusje.user && typeof klusje.user['profile_photo_path'] === 'string' ? (
                                        <img
                                            src={`/storage/${klusje.user['profile_photo_path']}`}
                                            alt={klusje.user.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <User size={28} />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold">{klusje.user?.name ?? 'Onbekend'}</span>
                                        <ShieldCheck className="h-4 w-4 text-blue-400" />
                                    </div>
                                    {klusje.user?.rating_count && klusje.user.rating_count > 0 ? (
                                        <div className="flex items-center text-sm text-neutral-600">
                                            <Star className="mr-1 h-4 w-4 fill-current text-yellow-400" />
                                            <span className="mr-1 font-medium text-neutral-900">
                                                {Number(klusje.user.rating_avg ?? 0).toFixed(1)}
                                            </span>
                                            <span className="text-neutral-500">({klusje.user.rating_count})</span>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-neutral-500">Geverifieerde gebruiker</div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                {isOwner ? (
                                    <>
                                        <Button
                                            asChild
                                            className="h-12 w-full rounded-2xl bg-orange-500 font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600"
                                        >
                                            <Link href={`/jobs/${klusje.id}/offers`}>
                                                <ClipboardList className="mr-2 h-4 w-4" />
                                                Bekijk aanmeldingen{offerCount > 0 ? ` (${offerCount})` : ''}
                                            </Link>
                                        </Button>
                                        {(klusje.status === 'assigned' || klusje.status === 'in_progress') && (
                                            <Button
                                                asChild
                                                className="h-12 w-full rounded-2xl bg-green-500 font-bold text-white shadow-lg shadow-green-500/20 hover:bg-green-600"
                                            >
                                                <Link
                                                    href={`/jobs/${klusje.id}/checkout`}
                                                    method="post"
                                                    as="button"
                                                >
                                                    <CreditCard className="mr-2 h-4 w-4" />
                                                    Betaal en voltooi (€{klusje.compensation})
                                                </Link>
                                            </Button>
                                        )}
                                        {klusje.status === 'open' && (
                                            <Button
                                                asChild
                                                variant="outline"
                                                className="h-12 w-full rounded-2xl border-neutral-200 font-bold"
                                            >
                                                <Link href={`/jobs/${klusje.id}/edit`}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Bewerk klus
                                                </Link>
                                            </Button>
                                        )}
                                    </>
                                ) : canApply ? (
                                    <Button
                                        onClick={handleMeldJeAan}
                                        className="h-12 w-full rounded-2xl bg-orange-500 font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600"
                                    >
                                        Meld je aan voor klus
                                    </Button>
                                ) : viewerOffer ? (
                                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                                        Je hebt je aangemeld (status:{' '}
                                        <span className="font-semibold">{viewerOffer.status}</span>).
                                    </div>
                                ) : klusje.status !== 'open' ? (
                                    <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 text-sm text-neutral-600">
                                        Deze klus is niet meer beschikbaar voor aanmeldingen.
                                    </div>
                                ) : null}

                                {!isOwner && (
                                    <Button
                                        variant="outline"
                                        className="h-12 w-full rounded-2xl border-neutral-200 font-bold"
                                        onClick={handleStuurBericht}
                                        disabled={conversation.processing}
                                    >
                                        <MessageSquare className="mr-2 h-4 w-4" /> Stuur bericht
                                    </Button>
                                )}
                            </div>
                        </div>

                        {canReviewTarget && (
                            <ReviewForm
                                klusjeId={klusje.id}
                                toUserId={canReviewTarget.id}
                                toUserName={canReviewTarget.name}
                            />
                        )}

                        {klusje.reviews && klusje.reviews.length > 0 && (
                            <div className="rounded-[2rem] border border-neutral-100 bg-white p-6 shadow-sm">
                                <h3 className="mb-4 text-lg font-bold text-neutral-900">Reviews</h3>
                                <div className="space-y-4">
                                    {klusje.reviews.map((review) => (
                                        <div key={review.id} className="border-b border-neutral-100 pb-3 last:border-0">
                                            <div className="mb-1 flex items-center gap-2">
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map((n) => (
                                                        <Star
                                                            key={n}
                                                            size={14}
                                                            className={
                                                                n <= review.rating
                                                                    ? 'fill-yellow-400 text-yellow-400'
                                                                    : 'text-neutral-300'
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs font-semibold text-neutral-700">
                                                    {review.from_user.name}
                                                </span>
                                            </div>
                                            {review.comment && (
                                                <p className="text-sm text-neutral-600">{review.comment}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <OfferDialog
                open={offerDialogOpen}
                onClose={() => setOfferDialogOpen(false)}
                klusjeId={klusje.id}
                klusjeTitle={klusje.title}
                defaultCompensation={String(klusje.compensation)}
            />
        </AppLayout>
    );
}
