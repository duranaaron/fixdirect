import { Head, Link, useForm } from '@inertiajs/react';
import { Bell, Check, ClipboardList, Hammer, Star, X, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Notification {
    id: string;
    type: string | null;
    data: Record<string, string | number | null>;
    read_at: string | null;
    created_at: string;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Meldingen', href: '/notifications' }];

const iconFor: Record<string, { icon: LucideIcon; className: string }> = {
    'offer.received': { icon: ClipboardList, className: 'bg-blue-50 text-blue-600' },
    'offer.accepted': { icon: Check, className: 'bg-green-50 text-green-600' },
    'offer.rejected': { icon: X, className: 'bg-slate-100 text-slate-500' },
    'klusje.completed': { icon: Hammer, className: 'bg-orange-50 text-orange-600' },
    'review.received': { icon: Star, className: 'bg-yellow-50 text-yellow-600' },
};

function describe(n: Notification): string {
    switch (n.type) {
        case 'offer.received':
            return `${n.data.klusser_name ?? 'Iemand'} heeft zich aangemeld voor '${n.data.klusje_title}'.`;
        case 'offer.accepted':
            return `Je aanmelding voor '${n.data.klusje_title}' is geaccepteerd.`;
        case 'offer.rejected':
            return `Je aanmelding voor '${n.data.klusje_title}' is afgewezen.`;
        case 'klusje.completed':
            return `De klus '${n.data.klusje_title}' is gemarkeerd als voltooid.`;
        case 'review.received':
            return `Je hebt een ${n.data.rating}/5 sterren review ontvangen voor '${n.data.klusje_title}'.`;
        default:
            return 'Nieuwe melding';
    }
}

export default function NotificationsIndex({ notifications = [] }: { notifications?: Notification[] }) {
    const markAll = useForm({});

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Meldingen" />

            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6 md:p-8">
                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Meldingen</h1>
                        <p className="text-muted-foreground">Recente activiteit op je account.</p>
                    </div>
                    {notifications.some((n) => !n.read_at) && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAll.post('/notifications/mark-all-read', { preserveScroll: true })}
                            disabled={markAll.processing}
                        >
                            Markeer alles als gelezen
                        </Button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                        <Bell className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                        <p className="text-sm text-slate-500">Je hebt nog geen meldingen.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {notifications.map((n) => {
                            const meta = iconFor[n.type ?? ''] ?? { icon: Bell, className: 'bg-slate-100 text-slate-600' };
                            const Icon = meta.icon;
                            const url = typeof n.data.url === 'string' ? n.data.url : '#';
                            const isUnread = !n.read_at;
                            return (
                                <Link
                                    key={n.id}
                                    href={url}
                                    className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                                        isUnread
                                            ? 'border-orange-100 bg-orange-50/50 hover:bg-orange-50'
                                            : 'border-slate-200 bg-white hover:bg-slate-50'
                                    }`}
                                >
                                    <div className={`rounded-lg p-2 ${meta.className}`}>
                                        <Icon size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-900">{describe(n)}</p>
                                        <p className="mt-0.5 text-xs text-slate-500">
                                            {new Date(n.created_at).toLocaleString('nl-BE')}
                                        </p>
                                    </div>
                                    {isUnread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-orange-500" />}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
