import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ChevronLeft, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { Conversation, Message } from '@/types';

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

function shouldShowDateSeparator(
    messages: Message[],
    index: number,
): boolean {
    if (index === 0) return true;
    const current = new Date(messages[index].created_at).toDateString();
    const previous = new Date(messages[index - 1].created_at).toDateString();
    return current !== previous;
}

export default function ConversationShow({
    conversation,
    messages: initialMessages,
}: {
    conversation: Conversation;
    messages: Message[];
}) {
    const { auth } = usePage().props;
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { data, setData, post, processing, reset } = useForm({ body: '' });

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

        return () => {
            channel.stopListening('MessageSent');
            window.Echo.leave(`conversation.${conversation.id}`);
        };
    }, [conversation.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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
                setMessages((prev) => prev.filter((m) => m.id !== Date.now()));
            },
        });

        inputRef.current?.focus();
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

                {/* Messages */}
                <div className="mb-4 flex-1 overflow-y-auto rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm"
                     style={{ height: 'calc(100vh - 16rem)' }}>
                    {messages.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-neutral-400">
                            <p>
                                Stuur een bericht om het gesprek te starten.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((message, index) => {
                                const isOwn =
                                    message.user_id === auth.user?.id;

                                return (
                                    <div key={message.id}>
                                        {shouldShowDateSeparator(
                                            messages,
                                            index,
                                        ) && (
                                            <div className="my-4 flex items-center gap-4">
                                                <div className="h-px flex-1 bg-neutral-100" />
                                                <span className="text-xs font-medium text-neutral-400">
                                                    {formatDateSeparator(
                                                        message.created_at,
                                                    )}
                                                </span>
                                                <div className="h-px flex-1 bg-neutral-100" />
                                            </div>
                                        )}

                                        <div
                                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                        >
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
                                                        isOwn
                                                            ? 'text-orange-200'
                                                            : 'text-neutral-400'
                                                    }`}
                                                >
                                                    {formatTime(
                                                        message.created_at,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input */}
                <form
                    onSubmit={sendMessage}
                    className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm"
                >
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
