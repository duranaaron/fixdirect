import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Calendar,
    Check,
    ChevronLeft,
    CreditCard,
    HandCoins,
    MapPin,
    Send,
    Star,
    User as UserIcon,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import OfferDialog from '@/components/offer-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInitials } from '@/hooks/use-initials';
import AppLayout from '@/layouts/app-layout';
import type { Klusje, KlusjeImage } from '@/types';

interface Counterpart {
    id: number;
    name: string;
    profile_photo_path: string | null;
    bio: string | null;
    location: string | null;
    rating_avg: string | null;
    rating_count: number;
}

interface CounterpartStats {
    completed_as_klusser: number;
    posted_count: number;
    member_since: string | null;
}

type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

interface MessageItem {
    kind: 'message';
    id: string;
    at: string;
    author_id: number;
    author_name: string;
    body: string;
}

interface OfferItem {
    kind: 'offer';
    id: string;
    at: string;
    offer_id: number;
    author_id: number;
    amount: number;
    message: string | null;
    status: OfferStatus;
    responded_at: string | null;
}

type TimelineItem = MessageItem | OfferItem;

interface ConversationLite {
    id: number;
    klusje_id: number;
    starter_id: number;
    owner_id: number;
    klusje: Klusje & { images?: KlusjeImage[] };
}

interface Props {
    conversation: ConversationLite;
    counterpart: Counterpart;
    counterpartStats: CounterpartStats;
    timeline: TimelineItem[];
    viewerRole: 'owner' | 'starter';
    latestOffer: OfferItem | null;
}

function formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('nl-BE', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Vandaag';
    if (date.toDateString() === yesterday.toDateString()) return 'Gisteren';

    return date.toLocaleDateString('nl-BE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });
}

const klusjeStatusMeta: Record<string, { label: string; className: string }> = {
    open: { label: 'Open', className: 'bg-green-100 text-green-700' },
    assigned: { label: 'Toegewezen', className: 'bg-amber-100 text-amber-700' },
    in_progress: { label: 'Bezig', className: 'bg-purple-100 text-purple-700' },
    completed: { label: 'Voltooid', className: 'bg-neutral-100 text-neutral-600' },
    cancelled: { label: 'Geannuleerd', className: 'bg-neutral-100 text-neutral-500' },
};

export default function ConversationShow({
    conversation,
    counterpart,
    counterpartStats,
    timeline,
    viewerRole,
    latestOffer,
}: Props) {
    const { auth } = usePage().props as unknown as { auth: { user: { id: number; name: string } } };
    const getInitials = useInitials();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [offerDialogOpen, setOfferDialogOpen] = useState(false);

    const { data, setData, post, processing, reset } = useForm({ body: '' });

    useEffect(() => {
        const channel = window.Echo.private(`conversation.${conversation.id}`);
        channel.listen('MessageSent', () => {
            router.reload({ only: ['timeline'] });
        });
        return () => {
            channel.stopListening('MessageSent');
            window.Echo.leave(`conversation.${conversation.id}`);
        };
    }, [conversation.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [timeline]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.body.trim() || processing) return;

        post(`/conversations/${conversation.id}/messages`, {
            preserveScroll: true,
            onSuccess: () => {
                reset('body');
                router.reload({ only: ['timeline'] });
            },
        });
        inputRef.current?.focus();
    };

    const klusje = conversation.klusje;
    const primaryImage = klusje.images?.find((i) => i.is_primary) || klusje.images?.[0];
    const klusjeStatus = klusjeStatusMeta[klusje.status] ?? klusjeStatusMeta.open;

    const viewerIsStarter = viewerRole === 'starter';
    const canMakeOffer =
        viewerIsStarter &&
        klusje.status === 'open' &&
        (!latestOffer || latestOffer.status === 'rejected' || latestOffer.status === 'withdrawn');

    const groupedTimeline = groupByDate(timeline);

    return (
        <AppLayout>
            <Head title={`Chat met ${counterpart.name} - FixDirect`} />

            <div className="mx-auto grid w-full max-w-6xl gap-6 p-4 lg:grid-cols-[320px_1fr] lg:p-6">
                {/* Sidebar (collapses on mobile) */}
                <aside className="flex flex-col gap-4">
                    <Link
                        href="/conversations"
                        className="flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-orange-600"
                    >
                        <ChevronLeft size={16} /> Alle berichten
                    </Link>

                    <KlusjeCard klusje={klusje} primaryImage={primaryImage} status={klusjeStatus} />

                    <CounterpartCard
                        counterpart={counterpart}
                        stats={counterpartStats}
                        getInitials={getInitials}
                    />
                </aside>

                {/* Main chat column */}
                <section className="flex min-h-[70vh] flex-col overflow-hidden rounded-[1.75rem] border border-neutral-100 bg-white shadow-sm">
                    <header className="flex items-center gap-3 border-b border-neutral-100 px-5 py-4">
                        <Avatar className="size-10">
                            <AvatarImage
                                src={counterpart.profile_photo_path ? `/storage/${counterpart.profile_photo_path}` : undefined}
                            />
                            <AvatarFallback className="bg-orange-100 font-semibold text-orange-700">
                                {getInitials(counterpart.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <div className="truncate font-bold text-neutral-900">{counterpart.name}</div>
                            <div className="text-xs text-neutral-500">
                                {viewerIsStarter ? 'Opdrachtgever' : 'Klusser'}
                            </div>
                        </div>
                        {latestOffer && <OfferStatusBadge status={latestOffer.status} />}
                    </header>

                    <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6" style={{ maxHeight: 'calc(100vh - 24rem)' }}>
                        {timeline.length === 0 ? (
                            <EmptyChatState viewerIsStarter={viewerIsStarter} />
                        ) : (
                            groupedTimeline.map((group) => (
                                <div key={group.date} className="space-y-3">
                                    <div className="my-2 flex items-center gap-3">
                                        <div className="h-px flex-1 bg-neutral-100" />
                                        <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                                            {group.date}
                                        </span>
                                        <div className="h-px flex-1 bg-neutral-100" />
                                    </div>
                                    {group.items.map((item) => (
                                        <TimelineEntry
                                            key={item.id}
                                            item={item}
                                            viewerId={auth.user.id}
                                            viewerRole={viewerRole}
                                            counterpartName={counterpart.name}
                                        />
                                    ))}
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form
                        onSubmit={sendMessage}
                        className="flex items-center gap-2 border-t border-neutral-100 px-4 py-3"
                    >
                        {canMakeOffer && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOfferDialogOpen(true)}
                                className="h-11 shrink-0 rounded-full border-orange-200 bg-orange-50 px-4 font-semibold text-orange-700 hover:bg-orange-100"
                            >
                                <HandCoins size={16} className="mr-1.5" />
                                {latestOffer ? 'Opnieuw aanbieden' : 'Maak een bod'}
                            </Button>
                        )}
                        <Input
                            ref={inputRef}
                            value={data.body}
                            onChange={(e) => setData('body', e.target.value)}
                            placeholder="Typ een bericht..."
                            className="h-11 flex-1 rounded-full border-neutral-200"
                            autoFocus
                        />
                        <Button
                            type="submit"
                            disabled={!data.body.trim() || processing}
                            className="h-11 shrink-0 rounded-full bg-orange-500 px-5 font-bold text-white hover:bg-orange-600"
                        >
                            <Send size={16} />
                        </Button>
                    </form>
                </section>
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

function KlusjeCard({
    klusje,
    primaryImage,
    status,
}: {
    klusje: Klusje;
    primaryImage: KlusjeImage | undefined;
    status: { label: string; className: string };
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
            {primaryImage ? (
                <Link href={`/jobs/${klusje.id}`} className="block h-32 w-full overflow-hidden bg-neutral-100">
                    <img
                        src={`/storage/${primaryImage.image_path}`}
                        alt={klusje.title}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                </Link>
            ) : (
                <div className="h-24 w-full bg-gradient-to-br from-orange-100 to-amber-50" />
            )}
            <div className="p-4">
                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    <Badge className={`${status.className} rounded-full border-none px-2 py-0 text-[10px] font-semibold`}>
                        {status.label}
                    </Badge>
                    <Badge className="rounded-full border-none bg-blue-50 px-2 py-0 text-[10px] font-semibold text-blue-700">
                        {klusje.category}
                    </Badge>
                </div>
                <Link href={`/jobs/${klusje.id}`} className="block">
                    <h2 className="mb-2 line-clamp-2 text-sm font-bold text-neutral-900 hover:text-orange-600">
                        {klusje.title}
                    </h2>
                </Link>
                <div className="space-y-1.5 text-xs text-neutral-500">
                    <div className="flex items-center gap-1.5">
                        <MapPin size={12} />
                        <span className="truncate">{klusje.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        <span>{new Date(klusje.date).toLocaleDateString('nl-BE')}</span>
                    </div>
                    <div className="pt-1 text-base font-bold text-orange-600">€{klusje.compensation}</div>
                </div>
            </div>
        </div>
    );
}

function CounterpartCard({
    counterpart,
    stats,
    getInitials,
}: {
    counterpart: Counterpart;
    stats: CounterpartStats;
    getInitials: (name: string) => string;
}) {
    const hasRating = counterpart.rating_count > 0;

    return (
        <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
                <Avatar className="size-12">
                    <AvatarImage
                        src={counterpart.profile_photo_path ? `/storage/${counterpart.profile_photo_path}` : undefined}
                    />
                    <AvatarFallback className="bg-orange-100 font-semibold text-orange-700">
                        {getInitials(counterpart.name)}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-neutral-900">{counterpart.name}</div>
                    {counterpart.location && (
                        <div className="flex items-center gap-1 text-xs text-neutral-500">
                            <MapPin size={11} /> {counterpart.location}
                        </div>
                    )}
                </div>
            </div>

            {hasRating && (
                <div className="mb-3 flex items-center gap-1 text-sm">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-neutral-900">{Number(counterpart.rating_avg).toFixed(1)}</span>
                    <span className="text-xs text-neutral-500">({counterpart.rating_count} reviews)</span>
                </div>
            )}

            {counterpart.bio && (
                <p className="mb-3 line-clamp-3 text-xs text-neutral-600">{counterpart.bio}</p>
            )}

            <dl className="mb-3 grid grid-cols-2 gap-2 border-t border-neutral-100 pt-3 text-xs">
                <div>
                    <dt className="text-neutral-500">Geplaatst</dt>
                    <dd className="font-bold text-neutral-900">{stats.posted_count}</dd>
                </div>
                <div>
                    <dt className="text-neutral-500">Voltooid</dt>
                    <dd className="font-bold text-neutral-900">{stats.completed_as_klusser}</dd>
                </div>
            </dl>

            <Link
                href={`/users/${counterpart.id}`}
                className="block rounded-full bg-neutral-100 py-1.5 text-center text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-200"
            >
                Bekijk profiel
            </Link>
        </div>
    );
}

function TimelineEntry({
    item,
    viewerId,
    viewerRole,
    counterpartName,
}: {
    item: TimelineItem;
    viewerId: number;
    viewerRole: 'owner' | 'starter';
    counterpartName: string;
}) {
    if (item.kind === 'message') {
        const isOwn = item.author_id === viewerId;
        return (
            <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                        isOwn ? 'bg-orange-500 text-white' : 'bg-neutral-100 text-neutral-900'
                    }`}
                >
                    <p className="whitespace-pre-wrap break-words text-sm">{item.body}</p>
                    <p className={`mt-1 text-[10px] ${isOwn ? 'text-orange-100' : 'text-neutral-400'}`}>
                        {formatTime(item.at)}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <OfferCard
            offer={item}
            viewerId={viewerId}
            viewerRole={viewerRole}
            counterpartName={counterpartName}
        />
    );
}

function OfferCard({
    offer,
    viewerId,
    viewerRole,
    counterpartName,
}: {
    offer: OfferItem;
    viewerId: number;
    viewerRole: 'owner' | 'starter';
    counterpartName: string;
}) {
    const viewerIsAuthor = offer.author_id === viewerId;
    const canRespond = viewerRole === 'owner' && offer.status === 'pending';
    const canWithdraw = viewerIsAuthor && offer.status === 'pending';

    const accept = useForm({});
    const reject = useForm({});
    const withdraw = useForm({});

    const handleAccept = () => {
        if (confirm(`Accepteer het bod van €${offer.amount.toFixed(2)}?`)) {
            accept.post(`/offers/${offer.offer_id}/accept`, { preserveScroll: true });
        }
    };

    const handleReject = () => {
        if (confirm('Dit bod afwijzen?')) {
            reject.post(`/offers/${offer.offer_id}/reject`, { preserveScroll: true });
        }
    };

    const handleWithdraw = () => {
        if (confirm('Je bod intrekken?')) {
            withdraw.delete(`/offers/${offer.offer_id}`, { preserveScroll: true });
        }
    };

    const statusColors: Record<OfferStatus, string> = {
        pending: 'border-orange-200 bg-orange-50',
        accepted: 'border-green-200 bg-green-50',
        rejected: 'border-neutral-200 bg-neutral-50 opacity-75',
        withdrawn: 'border-neutral-200 bg-neutral-50 opacity-75',
    };

    const statusIcons: Record<OfferStatus, React.ReactNode> = {
        pending: null,
        accepted: <Check className="h-4 w-4 text-green-600" />,
        rejected: <X className="h-4 w-4 text-neutral-500" />,
        withdrawn: <X className="h-4 w-4 text-neutral-500" />,
    };

    return (
        <div className="flex justify-center px-2">
            <div className={`w-full max-w-md rounded-2xl border p-4 shadow-sm ${statusColors[offer.status]}`}>
                <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                        <HandCoins className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                        <div className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                            {viewerIsAuthor ? 'Jouw bod' : `Bod van ${counterpartName}`}
                        </div>
                        <div className="text-xs text-neutral-400">{formatTime(offer.at)}</div>
                    </div>
                    <OfferStatusBadge status={offer.status} />
                </div>

                <div className="mb-3 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-orange-600">€{offer.amount.toFixed(2)}</span>
                </div>

                {offer.message && (
                    <p className="mb-3 whitespace-pre-wrap rounded-xl bg-white/70 p-3 text-sm text-neutral-700">
                        {offer.message}
                    </p>
                )}

                {canRespond && (
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={handleAccept}
                            disabled={accept.processing}
                            className="flex-1 bg-green-500 hover:bg-green-600"
                        >
                            <Check size={14} className="mr-1" /> Accepteer
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleReject}
                            disabled={reject.processing}
                            className="flex-1 border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                        >
                            <X size={14} className="mr-1" /> Afwijzen
                        </Button>
                    </div>
                )}

                {canWithdraw && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleWithdraw}
                        disabled={withdraw.processing}
                        className="w-full border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                    >
                        Bod intrekken
                    </Button>
                )}

                {offer.status === 'accepted' && viewerRole === 'owner' && (
                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-white p-3 text-xs text-green-800">
                        <CreditCard size={14} />
                        <span className="font-semibold">Klaar om te betalen? Ga naar de klus om af te ronden.</span>
                    </div>
                )}

                {offer.status === 'accepted' && viewerRole === 'starter' && (
                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-white p-3 text-xs text-green-800">
                        <Check size={14} />
                        <span className="font-semibold">Je bent geaccepteerd! Maak afspraken in de chat.</span>
                    </div>
                )}

                {statusIcons[offer.status] && offer.status !== 'pending' && offer.status !== 'accepted' && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
                        {statusIcons[offer.status]}
                        <span>
                            {offer.status === 'rejected' && 'Afgewezen'}
                            {offer.status === 'withdrawn' && 'Ingetrokken'}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

function OfferStatusBadge({ status }: { status: OfferStatus }) {
    const meta: Record<OfferStatus, { label: string; className: string }> = {
        pending: { label: 'In behandeling', className: 'bg-orange-100 text-orange-700' },
        accepted: { label: 'Geaccepteerd', className: 'bg-green-100 text-green-700' },
        rejected: { label: 'Afgewezen', className: 'bg-neutral-100 text-neutral-500' },
        withdrawn: { label: 'Ingetrokken', className: 'bg-neutral-100 text-neutral-500' },
    };
    const m = meta[status];
    return (
        <Badge className={`${m.className} rounded-full border-none px-2 py-0 text-[10px] font-semibold`}>
            {m.label}
        </Badge>
    );
}

function EmptyChatState({ viewerIsStarter }: { viewerIsStarter: boolean }) {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-2 py-12 text-center text-neutral-400">
            <div className="rounded-full bg-neutral-100 p-3">
                <UserIcon size={24} />
            </div>
            <p className="font-semibold text-neutral-600">Begin het gesprek</p>
            <p className="max-w-xs text-sm">
                {viewerIsStarter
                    ? 'Stel een vraag, vertel over je ervaring of maak direct een bod.'
                    : 'Stel vragen over de aanmelding om samen af te stemmen.'}
            </p>
        </div>
    );
}

function groupByDate(timeline: TimelineItem[]): { date: string; items: TimelineItem[] }[] {
    const groups: { date: string; items: TimelineItem[] }[] = [];
    let currentDate = '';
    for (const item of timeline) {
        const label = formatDate(item.at);
        if (label !== currentDate) {
            groups.push({ date: label, items: [] });
            currentDate = label;
        }
        groups[groups.length - 1].items.push(item);
    }
    return groups;
}
