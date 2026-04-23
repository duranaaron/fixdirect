import { Head } from '@inertiajs/react';
import { Star } from 'lucide-react';
import { useState } from 'react';
import ReviewForm from '@/components/review-form';
import AppLayout from '@/layouts/app-layout';
import { useInitials } from '@/hooks/use-initials';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Mijn reviews', href: '/my/reviews' }];

interface PersonRef {
    id: number;
    name: string;
    profile_photo_path: string | null;
}

interface PendingKlusje {
    id: number;
    title: string;
    assigned_klusser?: PersonRef;
    user?: PersonRef;
}

interface ReviewItem {
    id: number;
    rating: number;
    comment: string | null;
    created_at: string;
    from_user?: PersonRef;
    to_user?: PersonRef;
    klusje: { id: number; title: string };
}

interface Props {
    reviews_received: ReviewItem[];
    reviews_given: ReviewItem[];
    pending_as_poster: PendingKlusje[];
    pending_as_klusser: PendingKlusje[];
    rating_avg: string | null;
    rating_count: number;
}

function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex">
            {[1, 2, 3, 4, 5].map((n) => (
                <Star
                    key={n}
                    size={13}
                    className={n <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'}
                />
            ))}
        </div>
    );
}

function ReviewCard({ review, personKey }: { review: ReviewItem; personKey: 'from_user' | 'to_user' }) {
    const getInitials = useInitials();
    const person = review[personKey];
    const label = personKey === 'from_user' ? 'van' : 'voor';

    return (
        <div className="flex gap-3 border-b border-neutral-100 pb-4 last:border-0">
            <Avatar className="size-10 shrink-0">
                <AvatarImage
                    src={person?.profile_photo_path ? `/storage/${person.profile_photo_path}` : undefined}
                />
                <AvatarFallback className="bg-neutral-200 text-black">
                    {getInitials(person?.name ?? '?')}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="mb-0.5 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-neutral-900">{person?.name}</span>
                    <Stars rating={review.rating} />
                    <span className="text-xs text-neutral-400">
                        {new Date(review.created_at).toLocaleDateString('nl-BE')}
                    </span>
                </div>
                <p className="text-xs text-neutral-500">
                    {label} &ldquo;{review.klusje.title}&rdquo;
                </p>
                {review.comment && (
                    <p className="mt-1 text-sm text-neutral-700">{review.comment}</p>
                )}
            </div>
        </div>
    );
}

function PendingReviewItem({ klusjeId, klusjeTitle, toUserId, toUserName }: {
    klusjeId: number;
    klusjeTitle: string;
    toUserId: number;
    toUserName: string;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                    <p className="text-sm font-semibold text-neutral-900">{klusjeTitle}</p>
                    <p className="text-xs text-neutral-500">Beoordeel <span className="font-medium">{toUserName}</span></p>
                </div>
                {!open && (
                    <button
                        onClick={() => setOpen(true)}
                        className="shrink-0 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600"
                    >
                        Schrijf review
                    </button>
                )}
            </div>
            {open && (
                <ReviewForm klusjeId={klusjeId} toUserId={toUserId} toUserName={toUserName} />
            )}
        </div>
    );
}

export default function MyReviews({
    reviews_received,
    reviews_given,
    pending_as_poster,
    pending_as_klusser,
    rating_avg,
    rating_count,
}: Props) {
    const pendingAll = [
        ...pending_as_poster.map((k) => ({
            klusjeId: k.id,
            klusjeTitle: k.title,
            toUserId: k.assigned_klusser!.id,
            toUserName: k.assigned_klusser!.name,
        })),
        ...pending_as_klusser.map((k) => ({
            klusjeId: k.id,
            klusjeTitle: k.title,
            toUserId: k.user!.id,
            toUserName: k.user!.name,
        })),
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mijn reviews" />

            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6 md:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mijn reviews</h1>
                        <p className="text-muted-foreground">Overzicht van jouw beoordelingen.</p>
                    </div>
                    {rating_count > 0 && (
                        <div className="flex items-center gap-2 rounded-2xl border border-yellow-100 bg-yellow-50 px-5 py-3">
                            <Star size={20} className="fill-yellow-400 text-yellow-400" />
                            <span className="text-2xl font-bold text-neutral-900">
                                {Number(rating_avg).toFixed(1)}
                            </span>
                            <span className="text-sm text-neutral-500">({rating_count})</span>
                        </div>
                    )}
                </div>

                {pendingAll.length > 0 && (
                    <section className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-base font-bold text-neutral-900">
                            Openstaande reviews
                            <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                                {pendingAll.length}
                            </span>
                        </h2>
                        <div className="space-y-3">
                            {pendingAll.map((item) => (
                                <PendingReviewItem key={`${item.klusjeId}-${item.toUserId}`} {...item} />
                            ))}
                        </div>
                    </section>
                )}

                <section className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-base font-bold text-neutral-900">
                        Ontvangen reviews
                        <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                            {reviews_received.length}
                        </span>
                    </h2>
                    {reviews_received.length === 0 ? (
                        <p className="text-sm text-neutral-500">Je hebt nog geen reviews ontvangen.</p>
                    ) : (
                        <div className="space-y-4">
                            {reviews_received.map((r) => (
                                <ReviewCard key={r.id} review={r} personKey="from_user" />
                            ))}
                        </div>
                    )}
                </section>

                <section className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-base font-bold text-neutral-900">
                        Gegeven reviews
                        <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                            {reviews_given.length}
                        </span>
                    </h2>
                    {reviews_given.length === 0 ? (
                        <p className="text-sm text-neutral-500">Je hebt nog geen reviews gegeven.</p>
                    ) : (
                        <div className="space-y-4">
                            {reviews_given.map((r) => (
                                <ReviewCard key={r.id} review={r} personKey="to_user" />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}
