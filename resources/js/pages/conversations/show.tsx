import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    Check,
    ChevronLeft,
    Euro,
    Send,
    Tag,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { Conversation, Message, PriceProposal } from '@/types';

function formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('nl-BE', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatDateSeparator(dateString: string): string {
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

type TimelineItem =
    | { type: 'message'; data: Message }
    | { type: 'proposal'; data: PriceProposal };

function buildTimeline(
    messages: Message[],
    proposals: PriceProposal[],
): TimelineItem[] {
    const items: TimelineItem[] = [
        ...messages.map(
            (m) => ({ type: 'message', data: m }) as TimelineItem,
        ),
        ...proposals.map(
            (p) => ({ type: 'proposal', data: p }) as TimelineItem,
        ),
    ];
    items.sort(
        (a, b) =>
            new Date(a.data.created_at).getTime() -
            new Date(b.data.created_at).getTime(),
    );
    return items;
}

function shouldShowDateSeparatorForTimeline(
    items: TimelineItem[],
    index: number,
): boolean {
    if (index === 0) return true;
    const current = new Date(items[index].data.created_at).toDateString();
    const previous = new Date(items[index - 1].data.created_at).toDateString();
    return current !== previous;
}

export default function ConversationShow({
    conversation,
    messages: initialMessages,
    priceProposals: initialProposals,
}: {
    conversation: Conversation;
    messages: Message[];
    priceProposals: PriceProposal[];
}) {
    const { auth } = usePage().props;
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [proposals, setProposals] = useState<PriceProposal[]>(
        initialProposals ?? [],
    );
    const [showProposalForm, setShowProposalForm] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { data, setData, post, processing, reset } = useForm({ body: '' });
    const proposalForm = useForm({ amount: '', scheduled_at: '' });

    const otherUser =
        auth.user?.id === conversation.starter_id
            ? conversation.owner
            : conversation.starter;

    useEffect(() => {
        const channel = window.Echo.private(
            `conversation.${conversation.id}`,
        );

        channel.listen('MessageSent', (e: { message: Message }) => {
            setMessages((prev) => [...prev, e.message]);
        });

        channel.listen(
            'PriceProposalSent',
            (e: { priceProposal: PriceProposal }) => {
                setProposals((prev) => [...prev, e.priceProposal]);
            },
        );

        return () => {
            channel.stopListening('MessageSent');
            channel.stopListening('PriceProposalSent');
            window.Echo.leave(`conversation.${conversation.id}`);
        };
    }, [conversation.id]);

    const timeline = buildTimeline(messages, proposals);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [timeline.length]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.body.trim() || processing) return;

        const body = data.body;

        setMessages((prev) => [
            ...prev,
            {
                id: Date.now(),
                conversation_id: conversation.id,
                user_id: auth.user!.id,
                body,
                read_at: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                user: { id: auth.user!.id, name: auth.user!.name },
            },
        ]);

        reset('body');

        post(`/conversations/${conversation.id}/messages`, {
            data: { body },
            preserveScroll: true,
            preserveState: true,
            onError: () => {
                setMessages((prev) =>
                    prev.filter((m) => m.id !== Date.now()),
                );
            },
        });

        inputRef.current?.focus();
    };

    const sendProposal = (e: React.FormEvent) => {
        e.preventDefault();
        if (
            !proposalForm.data.amount ||
            !proposalForm.data.scheduled_at ||
            proposalForm.processing
        ) {
            return;
        }

        proposalForm.post(
            `/conversations/${conversation.id}/proposals`,
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    proposalForm.reset();
                    setShowProposalForm(false);
                    router.reload({ only: ['priceProposals'] });
                },
            },
        );
    };

    const respondToProposal = (
        proposalId: number,
        action: 'accept' | 'decline',
    ) => {
        router.patch(
            `/proposals/${proposalId}/${action}`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setProposals((prev) =>
                        prev.map((p) =>
                            p.id === proposalId
                                ? {
                                      ...p,
                                      status:
                                          action === 'accept'
                                              ? 'accepted'
                                              : 'declined',
                                      responded_at:
                                          new Date().toISOString(),
                                  }
                                : p,
                        ),
                    );
                },
            },
        );
    };

    return (
        <AppLayout>
            <Head
                title={`Chat met ${otherUser?.name ?? 'Onbekend'} - FixDirect`}
            />

            <div className="container mx-auto flex max-w-3xl flex-col px-4 py-4">
                {/* Header */}
                <div className="mb-4 flex items-center gap-4 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
                    <Link
                        href="/conversations"
                        className="flex items-center text-neutral-500 transition-colors hover:text-orange-600"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Link>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500 font-bold text-white">
                        {otherUser?.name?.charAt(0).toUpperCase() ?? '?'}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="font-bold text-neutral-900">
                            {otherUser?.name ?? 'Onbekend'}
                        </div>
                        <Link
                            href={`/jobs/${conversation.klusje_id}`}
                            className="truncate text-sm text-orange-500 hover:text-orange-600"
                        >
                            {conversation.klusje?.title}
                        </Link>
                    </div>
                </div>

                {/* Messages + Proposals Timeline */}
                <div
                    className="mb-4 flex-1 overflow-y-auto rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm"
                    style={{ height: 'calc(100vh - 16rem)' }}
                >
                    {timeline.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-neutral-400">
                            <p>
                                Stuur een bericht om het gesprek te starten.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {timeline.map((item, index) => {
                                const showDate =
                                    shouldShowDateSeparatorForTimeline(
                                        timeline,
                                        index,
                                    );

                                return (
                                    <div
                                        key={`${item.type}-${item.data.id}`}
                                    >
                                        {showDate && (
                                            <div className="my-4 flex items-center gap-4">
                                                <div className="h-px flex-1 bg-neutral-100" />
                                                <span className="text-xs font-medium text-neutral-400">
                                                    {formatDateSeparator(
                                                        item.data
                                                            .created_at,
                                                    )}
                                                </span>
                                                <div className="h-px flex-1 bg-neutral-100" />
                                            </div>
                                        )}

                                        {item.type === 'message' ? (
                                            <MessageBubble
                                                message={item.data}
                                                isOwn={
                                                    item.data.user_id ===
                                                    auth.user?.id
                                                }
                                            />
                                        ) : (
                                            <ProposalCard
                                                proposal={item.data}
                                                isOwn={
                                                    item.data.user_id ===
                                                    auth.user?.id
                                                }
                                                onAccept={() =>
                                                    respondToProposal(
                                                        item.data.id,
                                                        'accept',
                                                    )
                                                }
                                                onDecline={() =>
                                                    respondToProposal(
                                                        item.data.id,
                                                        'decline',
                                                    )
                                                }
                                            />
                                        )}
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Proposal Form */}
                {showProposalForm && (
                    <form
                        onSubmit={sendProposal}
                        className="mb-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 shadow-sm"
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-orange-700">
                                <Tag className="h-4 w-4" />
                                Prijsvoorstel doen
                            </h4>
                            <button
                                type="button"
                                onClick={() => setShowProposalForm(false)}
                                className="text-neutral-400 hover:text-neutral-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="flex-1">
                                <label className="mb-1 block text-xs font-medium text-neutral-600">
                                    Bedrag (€)
                                </label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="1"
                                    placeholder="bv. 75.00"
                                    value={proposalForm.data.amount}
                                    onChange={(e) =>
                                        proposalForm.setData(
                                            'amount',
                                            e.target.value,
                                        )
                                    }
                                    className="h-10 rounded-xl border-orange-200"
                                />
                                {proposalForm.errors.amount && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {proposalForm.errors.amount}
                                    </p>
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="mb-1 block text-xs font-medium text-neutral-600">
                                    Datum
                                </label>
                                <Input
                                    type="date"
                                    min={
                                        new Date()
                                            .toISOString()
                                            .split('T')[0]
                                    }
                                    value={proposalForm.data.scheduled_at}
                                    onChange={(e) =>
                                        proposalForm.setData(
                                            'scheduled_at',
                                            e.target.value,
                                        )
                                    }
                                    className="h-10 rounded-xl border-orange-200"
                                />
                                {proposalForm.errors.scheduled_at && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {proposalForm.errors.scheduled_at}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-end">
                                <Button
                                    type="submit"
                                    disabled={
                                        !proposalForm.data.amount ||
                                        !proposalForm.data.scheduled_at ||
                                        proposalForm.processing
                                    }
                                    className="h-10 rounded-xl bg-orange-500 px-5 font-bold text-white hover:bg-orange-600"
                                >
                                    Voorstellen
                                </Button>
                            </div>
                        </div>
                    </form>
                )}

                {/* Input */}
                <form
                    onSubmit={sendMessage}
                    className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm"
                >
                    <button
                        type="button"
                        onClick={() =>
                            setShowProposalForm(!showProposalForm)
                        }
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                            showProposalForm
                                ? 'border-orange-300 bg-orange-100 text-orange-600'
                                : 'border-neutral-200 text-neutral-400 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-500'
                        }`}
                        title="Stel een prijs voor"
                    >
                        <Euro className="h-5 w-5" />
                    </button>
                    <Input
                        ref={inputRef}
                        value={data.body}
                        onChange={(e) => setData('body', e.target.value)}
                        placeholder="Typ een bericht..."
                        className="h-11 flex-1 rounded-xl border-neutral-200"
                        autoFocus
                    />
                    <Button
                        type="submit"
                        disabled={!data.body.trim() || processing}
                        className="h-11 rounded-xl bg-orange-500 px-5 font-bold text-white hover:bg-orange-600"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}

/** --- HELPER COMPONENTS --- */

function MessageBubble({
    message,
    isOwn,
}: {
    message: Message;
    isOwn: boolean;
}) {
    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    isOwn
                        ? 'bg-orange-500 text-white'
                        : 'bg-neutral-100 text-neutral-900'
                }`}
            >
                <p className="whitespace-pre-wrap break-words text-sm">
                    {message.body}
                </p>
                <p
                    className={`mt-1 text-[10px] ${
                        isOwn ? 'text-orange-200' : 'text-neutral-400'
                    }`}
                >
                    {formatTime(message.created_at)}
                </p>
            </div>
        </div>
    );
}

function ProposalCard({
    proposal,
    isOwn,
    onAccept,
    onDecline,
}: {
    proposal: PriceProposal;
    isOwn: boolean;
    onAccept: () => void;
    onDecline: () => void;
}) {
    const statusConfig = {
        pending: {
            bg: 'bg-amber-50 border-amber-200',
            badge: 'bg-amber-100 text-amber-700',
            label: 'In afwachting',
        },
        accepted: {
            bg: 'bg-emerald-50 border-emerald-200',
            badge: 'bg-emerald-100 text-emerald-700',
            label: 'Geaccepteerd ✓',
        },
        declined: {
            bg: 'bg-red-50 border-red-200',
            badge: 'bg-red-100 text-red-700',
            label: 'Afgewezen',
        },
    };

    const config = statusConfig[proposal.status];
    const scheduledDate = new Date(proposal.scheduled_at);

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`w-full max-w-[85%] rounded-2xl border p-4 ${config.bg}`}
            >
                <div className="mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-neutral-500">
                        <Tag className="h-3.5 w-3.5" />
                        {isOwn ? 'Jouw voorstel' : `Voorstel van ${proposal.user?.name ?? 'Onbekend'}`}
                    </span>
                    <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${config.badge}`}
                    >
                        {config.label}
                    </span>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Euro className="h-4 w-4 text-neutral-400" />
                        <span className="text-lg font-black text-neutral-900">
                            €{parseFloat(proposal.amount).toFixed(2).replace('.', ',')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-neutral-400" />
                        <span className="text-sm font-medium text-neutral-700">
                            {scheduledDate.toLocaleDateString('nl-BE', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </span>
                    </div>
                </div>

                {/* Accept/Decline buttons - only for the OTHER party and only for pending */}
                {!isOwn && proposal.status === 'pending' && (
                    <div className="mt-3 flex gap-2">
                        <button
                            onClick={onAccept}
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-600"
                        >
                            <Check className="h-3.5 w-3.5" />
                            Accepteren
                        </button>
                        <button
                            onClick={onDecline}
                            className="flex items-center gap-1.5 rounded-xl bg-neutral-200 px-4 py-2 text-xs font-bold text-neutral-600 transition-colors hover:bg-neutral-300"
                        >
                            <X className="h-3.5 w-3.5" />
                            Weigeren
                        </button>
                    </div>
                )}

                <p className="mt-2 text-[10px] text-neutral-400">
                    {formatTime(proposal.created_at)}
                </p>
            </div>
        </div>
    );
}
