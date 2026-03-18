import { Head, Link } from '@inertiajs/react';
import { MessageSquare, Search } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import type { Conversation } from '@/types';
import { usePage } from '@inertiajs/react';

function timeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Zojuist';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m geleden`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}u geleden`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d geleden`;

    return date.toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' });
}

export default function ConversationsIndex({
    conversations,
}: {
    conversations: Conversation[];
}) {
    const { auth } = usePage().props;

    return (
        <AppLayout>
            <Head title="Berichten - FixDirect" />

            <div className="container mx-auto max-w-3xl px-4 py-8">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-neutral-900">
                        Berichten
                    </h1>
                </div>

                {conversations.length === 0 ? (
                    <div className="rounded-[2rem] border border-neutral-100 bg-white p-12 text-center shadow-sm">
                        <MessageSquare className="mx-auto mb-4 h-12 w-12 text-neutral-300" />
                        <h2 className="mb-2 text-xl font-bold text-neutral-900">
                            Nog geen berichten
                        </h2>
                        <p className="mb-6 text-neutral-500">
                            Start een gesprek door op &quot;Stuur bericht&quot;
                            te klikken bij een klusje.
                        </p>
                        <Link
                            href="/find"
                            className="inline-flex h-10 items-center rounded-xl bg-orange-500 px-6 font-bold text-white transition-colors hover:bg-orange-600"
                        >
                            <Search className="mr-2 h-4 w-4" />
                            Bekijk klusjes
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {conversations.map((conversation) => {
                            const otherUser =
                                auth.user?.id === conversation.starter_id
                                    ? conversation.owner
                                    : conversation.starter;

                            return (
                                <Link
                                    key={conversation.id}
                                    href={`/conversations/${conversation.id}`}
                                    className="flex items-center gap-4 rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm transition-all hover:border-orange-200 hover:shadow-md"
                                >
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-500 text-lg font-bold text-white">
                                        {otherUser?.name
                                            ?.charAt(0)
                                            .toUpperCase() ?? '?'}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="mb-1 flex items-center justify-between gap-2">
                                            <span className="truncate font-bold text-neutral-900">
                                                {otherUser?.name ??
                                                    'Onbekend'}
                                            </span>
                                            {conversation.latest_message && (
                                                <span className="shrink-0 text-xs text-neutral-400">
                                                    {timeAgo(
                                                        conversation
                                                            .latest_message
                                                            .created_at,
                                                    )}
                                                </span>
                                            )}
                                        </div>

                                        <p className="truncate text-sm text-neutral-500">
                                            {conversation.klusje?.title}
                                        </p>

                                        <p className="mt-1 truncate text-sm text-neutral-400">
                                            {conversation.latest_message
                                                ?.body ?? 'Nog geen berichten'}
                                        </p>
                                    </div>

                                    {(conversation.unread_count ?? 0) > 0 && (
                                        <Badge className="shrink-0 rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white hover:bg-orange-500">
                                            {conversation.unread_count}
                                        </Badge>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
