import { Head, Link, useForm } from '@inertiajs/react';
import { Calendar, Lock, MapPin, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';
import type { BreadcrumbItem, Klusje, KlusjeImage } from '@/types';

interface OfferSummary {
    id: number;
    status: string;
    message: string | null;
    proposed_compensation: string | null;
    created_at: string;
    klusser: { id: number; name: string };
}

interface PaymentSummary {
    id: number;
    status: string;
    amount: string;
    platform_fee: string;
    currency: string;
    held_at: string | null;
    released_at: string | null;
    refunded_at: string | null;
    stripe_payment_intent_id: string | null;
    stripe_transfer_id: string | null;
    stripe_refund_id: string | null;
}

interface ReviewSummary {
    id: number;
    rating: number;
    comment: string | null;
    from_user: { id: number; name: string };
}

type ShowKlusje = Klusje & {
    user?: { id: number; name: string; email: string };
    assigned_klusser?: { id: number; name: string; email: string } | null;
    images?: KlusjeImage[];
    offers: OfferSummary[];
    reviews: ReviewSummary[];
    payments: PaymentSummary[];
};

export default function AdminKlusjeShow({ klusje }: { klusje: ShowKlusje }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Klusjes', href: '/admin/klusjes' },
        { title: klusje.title, href: `/admin/klusjes/${klusje.id}` },
    ];

    const cancel = useForm({});
    const canCancel = ['open', 'assigned', 'in_progress'].includes(klusje.status);

    const handleCancel = () => {
        if (confirm('Deze klus annuleren? Een eventuele escrow wordt teruggestort.')) {
            cancel.post(`/admin/klusjes/${klusje.id}/cancel`, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Admin — ${klusje.title}`} />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm md:flex-row md:items-start md:justify-between">
                    <div>
                        <div className="mb-2 flex flex-wrap gap-2">
                            <Badge className="rounded-full border-none bg-blue-50 px-2 py-0 text-[10px] font-semibold text-blue-700">
                                {klusje.category}
                            </Badge>
                            <Badge className="rounded-full border-none bg-neutral-100 px-2 py-0 text-[10px] font-semibold text-neutral-700">
                                {klusje.status}
                            </Badge>
                        </div>
                        <h1 className="text-xl font-bold text-neutral-900">{klusje.title}</h1>
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                            <span className="inline-flex items-center gap-1">
                                <MapPin size={12} /> {klusje.location}
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <Calendar size={12} /> {new Date(klusje.date).toLocaleDateString('nl-BE')}
                            </span>
                            <span className="font-semibold text-orange-600">€{klusje.compensation}</span>
                        </div>
                        <p className="mt-3 text-sm text-neutral-700">{klusje.description}</p>
                    </div>
                    {canCancel && (
                        <Button
                            variant="outline"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={handleCancel}
                            disabled={cancel.processing}
                        >
                            <XCircle className="mr-2 h-4 w-4" /> Annuleer klus
                        </Button>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Panel title="Vrager">
                        {klusje.user ? (
                            <Link href={`/admin/users/${klusje.user.id}`} className="block text-sm hover:text-orange-700">
                                <div className="font-semibold">{klusje.user.name}</div>
                                <div className="text-xs text-neutral-500">{klusje.user.email}</div>
                            </Link>
                        ) : (
                            <span className="text-xs text-neutral-400">—</span>
                        )}
                    </Panel>

                    <Panel title="Klusser">
                        {klusje.assigned_klusser ? (
                            <Link href={`/admin/users/${klusje.assigned_klusser.id}`} className="block text-sm hover:text-orange-700">
                                <div className="font-semibold">{klusje.assigned_klusser.name}</div>
                                <div className="text-xs text-neutral-500">{klusje.assigned_klusser.email}</div>
                            </Link>
                        ) : (
                            <span className="text-xs text-neutral-400">Nog niet toegewezen.</span>
                        )}
                    </Panel>
                </div>

                <Panel title={`Betalingen (${klusje.payments.length})`}>
                    {klusje.payments.length === 0 ? (
                        <EmptyMini text="Nog geen betalingen." />
                    ) : (
                        <table className="w-full text-xs">
                            <thead className="text-left text-neutral-500">
                                <tr>
                                    <th className="py-2">Status</th>
                                    <th className="py-2">Bedrag</th>
                                    <th className="py-2">Fee</th>
                                    <th className="py-2">Held</th>
                                    <th className="py-2">Released</th>
                                    <th className="py-2">Refunded</th>
                                    <th className="py-2">Stripe IDs</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {klusje.payments.map((p) => (
                                    <tr key={p.id}>
                                        <td className="py-2">
                                            <Badge className="rounded-full border-none bg-neutral-100 px-2 py-0 text-[10px] font-semibold">
                                                {p.status === 'held' && <Lock className="mr-1 inline h-2.5 w-2.5" />}
                                                {p.status}
                                            </Badge>
                                        </td>
                                        <td className="py-2 font-semibold">€{p.amount}</td>
                                        <td className="py-2">€{p.platform_fee}</td>
                                        <td className="py-2 text-neutral-500">{p.held_at ? new Date(p.held_at).toLocaleDateString('nl-BE') : '—'}</td>
                                        <td className="py-2 text-neutral-500">{p.released_at ? new Date(p.released_at).toLocaleDateString('nl-BE') : '—'}</td>
                                        <td className="py-2 text-neutral-500">{p.refunded_at ? new Date(p.refunded_at).toLocaleDateString('nl-BE') : '—'}</td>
                                        <td className="py-2 font-mono text-[10px] text-neutral-400">
                                            {p.stripe_payment_intent_id && <div>pi: {p.stripe_payment_intent_id}</div>}
                                            {p.stripe_transfer_id && <div>tr: {p.stripe_transfer_id}</div>}
                                            {p.stripe_refund_id && <div>re: {p.stripe_refund_id}</div>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Panel>

                <Panel title={`Biedingen (${klusje.offers.length})`}>
                    {klusje.offers.length === 0 ? (
                        <EmptyMini text="Geen biedingen." />
                    ) : (
                        <ul className="divide-y divide-neutral-100 text-sm">
                            {klusje.offers.map((o) => (
                                <li key={o.id} className="flex items-center justify-between py-2">
                                    <Link href={`/admin/users/${o.klusser.id}`} className="hover:text-orange-700">
                                        {o.klusser.name}
                                    </Link>
                                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                                        {o.proposed_compensation && <span>€{o.proposed_compensation}</span>}
                                        <span>{o.status}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>
            </div>
        </AdminLayout>
    );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-bold text-neutral-900">{title}</h2>
            {children}
        </section>
    );
}

function EmptyMini({ text }: { text: string }) {
    return <p className="py-4 text-center text-xs text-neutral-400">{text}</p>;
}
