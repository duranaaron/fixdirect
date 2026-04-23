import { Head, Link } from '@inertiajs/react';
import { ArrowDownLeft, ArrowUpRight, Clock, TrendingUp, Wallet } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Mijn balans', href: '/my/balance' }];

interface Transaction {
    id: number;
    klusje_title: string;
    role: 'vrager' | 'klusser';
    amount: string;
    is_income: boolean;
    status: string;
    status_label: string;
    date: string;
}

interface Props {
    total_earned: string;
    total_spent: string;
    in_escrow: string;
    transactions: Transaction[];
}

const statusColors: Record<string, string> = {
    pending: 'bg-slate-100 text-slate-600',
    held: 'bg-amber-50 text-amber-700',
    released: 'bg-green-50 text-green-700',
    refunded: 'bg-blue-50 text-blue-700',
    failed: 'bg-red-50 text-red-700',
};

export default function Balance({ total_earned, total_spent, in_escrow, transactions }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mijn balans" />

            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6 md:p-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mijn balans</h1>
                    <p className="text-muted-foreground">Overzicht van je inkomsten, uitgaven en escrow betalingen.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard
                        icon={TrendingUp}
                        iconClass="text-green-600"
                        bgClass="bg-green-50"
                        label="Totaal verdiend"
                        value={`€${total_earned}`}
                        sub="als klusser"
                    />
                    <StatCard
                        icon={Wallet}
                        iconClass="text-slate-600"
                        bgClass="bg-slate-100"
                        label="Totaal betaald"
                        value={`€${total_spent}`}
                        sub="als opdrachtgever"
                    />
                    <StatCard
                        icon={Clock}
                        iconClass="text-amber-600"
                        bgClass="bg-amber-50"
                        label="In escrow"
                        value={`€${in_escrow}`}
                        sub="wacht op vrijgave"
                    />
                </div>

                <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm">
                    <div className="border-b border-neutral-100 px-6 py-4">
                        <h2 className="font-bold text-slate-900">Transacties</h2>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="px-6 py-12 text-center text-sm text-slate-500">
                            Nog geen transacties.{' '}
                            <Link href="/find" className="font-semibold text-orange-600 hover:underline">
                                Vind een klusje
                            </Link>
                        </div>
                    ) : (
                        <ul className="divide-y divide-neutral-50">
                            {transactions.map((tx) => (
                                <li key={tx.id} className="flex items-center gap-4 px-6 py-4">
                                    <div
                                        className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                                            tx.is_income ? 'bg-green-100' : 'bg-slate-100'
                                        }`}
                                    >
                                        {tx.is_income ? (
                                            <ArrowDownLeft size={16} className="text-green-600" />
                                        ) : (
                                            <ArrowUpRight size={16} className="text-slate-500" />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-slate-900">
                                            {tx.klusje_title}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {tx.role === 'klusser' ? 'Ontvangen als klusser' : 'Betaald als opdrachtgever'}{' '}
                                            · {tx.date}
                                        </p>
                                    </div>

                                    <span
                                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                            statusColors[tx.status] ?? 'bg-slate-100 text-slate-600'
                                        }`}
                                    >
                                        {tx.status_label}
                                    </span>

                                    <span
                                        className={`w-20 shrink-0 text-right text-sm font-bold tabular-nums ${
                                            tx.is_income ? 'text-green-600' : 'text-slate-700'
                                        }`}
                                    >
                                        {tx.is_income ? '+' : '-'}€{tx.amount}
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

function StatCard({
    icon: Icon,
    iconClass,
    bgClass,
    label,
    value,
    sub,
}: {
    icon: React.ElementType;
    iconClass: string;
    bgClass: string;
    label: string;
    value: string;
    sub: string;
}) {
    return (
        <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
            <div className={`mb-3 inline-flex rounded-xl p-2.5 ${bgClass}`}>
                <Icon size={18} className={iconClass} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm font-medium text-slate-600">{label}</p>
            <p className="text-xs text-slate-400">{sub}</p>
        </div>
    );
}
