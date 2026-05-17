import { Head, Link } from '@inertiajs/react';
import { ArrowDownToLine, Plus, Wallet } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Mijn balans', href: '/my/balance' },
    { title: 'Uitbetalingen', href: '/my/withdrawals' },
];

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
}

interface Props {
    withdrawals: Withdrawal[];
    available_balance: string;
}

const statusColors: Record<string, string> = {
    pending: 'bg-slate-100 text-slate-600',
    approved: 'bg-blue-50 text-blue-700',
    paid: 'bg-green-50 text-green-700',
    rejected: 'bg-red-50 text-red-700',
};

export default function WithdrawalsIndex({ withdrawals, available_balance }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mijn uitbetalingen" />

            <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Uitbetalingen
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Vraag een uitbetaling aan vanuit je saldo.
                        </p>
                    </div>

                    <Button asChild className="h-10 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-white shadow-md shadow-orange-500/20 px-5">
                        <Link href="/my/withdrawals/create">
                            <Plus className="mr-1 h-4 w-4" /> Nieuwe aanvraag
                        </Link>
                    </Button>
                </div>

                <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="inline-flex rounded-xl bg-orange-50 p-3">
                            <Wallet size={20} className="text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-700">Beschikbaar voor uitbetaling</p>
                            <p className="text-3xl font-black text-slate-900">€{available_balance}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-neutral-100 bg-slate-50/50 px-6 py-4">
                        <h2 className="font-bold text-slate-900">Verzoeken</h2>
                    </div>

                    {withdrawals.length === 0 ? (
                        <div className="px-6 py-12 text-center text-sm text-slate-500">
                            Nog geen uitbetalingen aangevraagd.
                        </div>
                    ) : (
                        <ul className="divide-y divide-neutral-50">
                            {withdrawals.map((w) => (
                                <li key={w.id} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-50">
                                        <ArrowDownToLine size={18} className="text-orange-600" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-bold text-slate-900">
                                            €{w.amount} naar {w.iban}
                                        </p>
                                        <p className="text-xs font-medium text-slate-500 mt-0.5">
                                            {w.account_holder} · aangevraagd {w.created_at}
                                            {w.processed_at && ` · verwerkt ${w.processed_at}`}
                                        </p>
                                        {w.admin_note && (
                                            <p className="mt-1 text-xs text-slate-600">
                                                <span className="font-semibold">Notitie: </span>
                                                {w.admin_note}
                                            </p>
                                        )}
                                    </div>

                                    <span
                                        className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                            statusColors[w.status] ?? 'bg-slate-100 text-slate-600'
                                        }`}
                                    >
                                        {w.status_label}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
