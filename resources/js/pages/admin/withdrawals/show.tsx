import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import type { BreadcrumbItem } from '@/types';

interface StatusOption { value: string; label: string; }

interface Withdrawal {
    id: number;
    amount: string;
    iban: string;
    account_holder: string;
    status: string;
    status_label: string;
    admin_note: string | null;
    created_at: string;
    processed_at: string | null;
    available_balance: string;
    user: { id: number; name: string; email: string };
    processed_by: { id: number; name: string } | null;
}

const statusTints: Record<string, string> = {
    pending: 'bg-slate-100 text-slate-700',
    approved: 'bg-blue-50 text-blue-700',
    paid: 'bg-green-50 text-green-700',
    rejected: 'bg-red-50 text-red-700',
};

export default function AdminWithdrawalShow({
    withdrawal,
    statuses,
}: {
    withdrawal: Withdrawal;
    statuses: StatusOption[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Uitbetalingen', href: '/admin/withdrawals' },
        { title: `#${withdrawal.id}`, href: `/admin/withdrawals/${withdrawal.id}` },
    ];

    const { data, setData, post, processing, errors } = useForm({
        status: withdrawal.status,
        admin_note: withdrawal.admin_note ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/withdrawals/${withdrawal.id}/status`, { preserveScroll: true });
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Admin — Uitbetaling #${withdrawal.id}`} />

            <div className="space-y-6">
                <Link
                    href="/admin/withdrawals"
                    className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Terug naar overzicht
                </Link>

                <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-start justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wider text-neutral-500">Uitbetaling</p>
                            <h1 className="text-2xl font-bold text-neutral-900">€{withdrawal.amount}</h1>
                        </div>
                        <Badge className={`${statusTints[withdrawal.status] ?? 'bg-neutral-100 text-neutral-600'} rounded-full border-none px-3 py-1 text-xs font-semibold`}>
                            {withdrawal.status_label}
                        </Badge>
                    </div>

                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <dt className="text-xs uppercase tracking-wider text-neutral-500">Gebruiker</dt>
                            <dd className="mt-1 text-sm font-semibold">
                                <Link href={`/admin/users/${withdrawal.user.id}`} className="hover:text-orange-700">
                                    {withdrawal.user.name}
                                </Link>
                            </dd>
                            <dd className="text-xs text-neutral-500">{withdrawal.user.email}</dd>
                        </div>
                        <div>
                            <dt className="text-xs uppercase tracking-wider text-neutral-500">Beschikbaar saldo</dt>
                            <dd className="mt-1 text-sm font-semibold">€{withdrawal.available_balance}</dd>
                        </div>
                        <div>
                            <dt className="text-xs uppercase tracking-wider text-neutral-500">IBAN</dt>
                            <dd className="mt-1 font-mono text-sm">{withdrawal.iban}</dd>
                        </div>
                        <div>
                            <dt className="text-xs uppercase tracking-wider text-neutral-500">Rekeninghouder</dt>
                            <dd className="mt-1 text-sm">{withdrawal.account_holder}</dd>
                        </div>
                        <div>
                            <dt className="text-xs uppercase tracking-wider text-neutral-500">Aangevraagd</dt>
                            <dd className="mt-1 text-sm">{withdrawal.created_at}</dd>
                        </div>
                        <div>
                            <dt className="text-xs uppercase tracking-wider text-neutral-500">Verwerkt</dt>
                            <dd className="mt-1 text-sm">
                                {withdrawal.processed_at ?? '—'}
                                {withdrawal.processed_by && (
                                    <span className="text-xs text-neutral-500"> door {withdrawal.processed_by.name}</span>
                                )}
                            </dd>
                        </div>
                    </dl>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
                    <h2 className="font-bold text-slate-900">Status wijzigen</h2>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                            <SelectTrigger id="status" className="h-10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {statuses.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="admin_note">Notitie (optioneel)</Label>
                        <textarea
                            id="admin_note"
                            rows={3}
                            placeholder="Bijv. reden van afwijzing of referentie van de overboeking"
                            value={data.admin_note}
                            onChange={(e) => setData('admin_note', e.target.value)}
                            className="w-full resize-none rounded-2xl border border-neutral-200 p-3 text-sm outline-none transition-all focus:border-orange-500 focus:ring-orange-500"
                        />
                        {errors.admin_note && <p className="text-sm text-red-600">{errors.admin_note}</p>}
                    </div>

                    <Button type="submit" disabled={processing} className="h-10 bg-orange-500 hover:bg-orange-600">
                        {processing ? 'Bezig...' : 'Opslaan'}
                    </Button>
                </form>
            </div>
        </AdminLayout>
    );
}
