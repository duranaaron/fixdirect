import { Head, Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import type { BreadcrumbItem, Klusje } from '@/types';

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    total: number;
}

interface StatusOption { value: string; label: string; }

type KlusjeRow = Klusje & {
    user?: { id: number; name: string };
    assigned_klusser?: { id: number; name: string } | null;
    held_payment?: { id: number; amount: string } | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Klusjes', href: '/admin/klusjes' },
];

const statusTints: Record<string, string> = {
    open: 'bg-blue-50 text-blue-700',
    assigned: 'bg-amber-50 text-amber-700',
    in_progress: 'bg-purple-50 text-purple-700',
    completed: 'bg-green-50 text-green-700',
    cancelled: 'bg-neutral-100 text-neutral-500',
};

export default function AdminKlusjesIndex({
    klusjes,
    filters,
    statuses,
}: {
    klusjes: Paginated<KlusjeRow>;
    filters: { status: string; search: string };
    statuses: StatusOption[];
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status || 'all');

    const apply = () => {
        router.get(
            '/admin/klusjes',
            {
                search: search || undefined,
                status: status !== 'all' ? status : undefined,
            },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin — Klusjes" />

            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-neutral-900">
                    Klusjes <span className="text-sm font-normal text-neutral-500">({klusjes.total})</span>
                </h1>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2">
                <div className="relative min-w-[220px] flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <Input
                        className="h-10 pl-10"
                        placeholder="Zoek op titel..."
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
                            <th className="px-4 py-3">Titel</th>
                            <th className="px-4 py-3">Vrager</th>
                            <th className="px-4 py-3">Klusser</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Vergoeding</th>
                            <th className="px-4 py-3">Escrow</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {klusjes.data.map((k) => (
                            <tr key={k.id} className="hover:bg-neutral-50/60">
                                <td className="px-4 py-3">
                                    <Link href={`/admin/klusjes/${k.id}`} className="font-semibold hover:text-orange-700">
                                        {k.title}
                                    </Link>
                                </td>
                                <td className="px-4 py-3 text-neutral-600">
                                    {k.user ? (
                                        <Link href={`/admin/users/${k.user.id}`} className="hover:text-orange-700">
                                            {k.user.name}
                                        </Link>
                                    ) : '—'}
                                </td>
                                <td className="px-4 py-3 text-neutral-600">
                                    {k.assigned_klusser ? (
                                        <Link href={`/admin/users/${k.assigned_klusser.id}`} className="hover:text-orange-700">
                                            {k.assigned_klusser.name}
                                        </Link>
                                    ) : '—'}
                                </td>
                                <td className="px-4 py-3">
                                    <Badge className={`${statusTints[k.status] ?? 'bg-neutral-100 text-neutral-600'} rounded-full border-none px-2 py-0 text-[10px] font-semibold`}>
                                        {k.status}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 font-semibold text-orange-600">€{k.compensation}</td>
                                <td className="px-4 py-3">
                                    {k.held_payment ? (
                                        <Badge className="rounded-full border-none bg-emerald-50 px-2 py-0 text-[10px] font-semibold text-emerald-700">
                                            €{k.held_payment.amount}
                                        </Badge>
                                    ) : (
                                        <span className="text-xs text-neutral-400">—</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {klusjes.data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-sm text-neutral-500">
                                    Geen klusjes gevonden.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {klusjes.last_page > 1 && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-1">
                    {klusjes.links.map((link, i) => (
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
