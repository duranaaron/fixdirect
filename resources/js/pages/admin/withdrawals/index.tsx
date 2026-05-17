import { Head, Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import type { BreadcrumbItem } from '@/types';

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    total: number;
}

interface StatusOption { value: string; label: string; }

interface WithdrawalRow {
    id: number;
    amount: string;
    iban: string;
    account_holder: string;
    status: string;
    created_at: string;
    user?: { id: number; name: string; email: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Uitbetalingen', href: '/admin/withdrawals' },
];

const statusTints: Record<string, string> = {
    pending: 'bg-slate-100 text-slate-700',
    approved: 'bg-blue-50 text-blue-700',
    paid: 'bg-green-50 text-green-700',
    rejected: 'bg-red-50 text-red-700',
};

export default function AdminWithdrawalsIndex({
    withdrawals,
    filters,
    statuses,
}: {
    withdrawals: Paginated<WithdrawalRow>;
    filters: { status: string; search: string };
    statuses: StatusOption[];
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status || 'all');

    const apply = () => {
        router.get(
            '/admin/withdrawals',
            {
                search: search || undefined,
                status: status !== 'all' ? status : undefined,
            },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin — Uitbetalingen" />

            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-neutral-900">
                    Uitbetalingen <span className="text-sm font-normal text-neutral-500">({withdrawals.total})</span>
                </h1>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2">
                <div className="relative min-w-[220px] flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <Input
                        className="h-10 pl-10"
                        placeholder="Zoek op gebruiker..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && apply()}
                    />
                </div>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="h-10 w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Alle statussen</SelectItem>
                        {statuses.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button onClick={apply} className="h-10">Filter</Button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
                <table className="w-full text-sm">
                    <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wider text-neutral-500">
                        <tr>
                            <th className="px-4 py-3">Gebruiker</th>
                            <th className="px-4 py-3">Bedrag</th>
                            <th className="px-4 py-3">IBAN</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Aangevraagd</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {withdrawals.data.map((w) => (
                            <tr key={w.id} className="hover:bg-neutral-50/60">
                                <td className="px-4 py-3">
                                    <Link href={`/admin/withdrawals/${w.id}`} className="font-semibold hover:text-orange-700">
                                        {w.user?.name ?? '—'}
                                    </Link>
                                    {w.user?.email && (
                                        <div className="text-xs text-neutral-500">{w.user.email}</div>
                                    )}
                                </td>
                                <td className="px-4 py-3 font-semibold text-orange-600">€{w.amount}</td>
                                <td className="px-4 py-3 font-mono text-xs text-neutral-600">{w.iban}</td>
                                <td className="px-4 py-3">
                                    <Badge className={`${statusTints[w.status] ?? 'bg-neutral-100 text-neutral-600'} rounded-full border-none px-2 py-0 text-[10px] font-semibold`}>
                                        {w.status}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-neutral-600">{w.created_at}</td>
                            </tr>
                        ))}
                        {withdrawals.data.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-sm text-neutral-500">
                                    Geen uitbetalingen gevonden.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {withdrawals.last_page > 1 && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-1">
                    {withdrawals.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url ?? '#'}
                            preserveScroll
                            preserveState
                            className={`min-w-[38px] rounded-lg px-3 py-1.5 text-xs transition-colors ${
                                link.active
                                    ? 'bg-slate-900 text-white'
                                    : link.url
                                      ? 'bg-white text-slate-700 hover:bg-slate-100'
                                      : 'cursor-not-allowed text-slate-300'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
