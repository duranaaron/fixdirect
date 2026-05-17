import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowDownLeft, ArrowDownToLine, ArrowUpRight, Clock, TrendingUp, Wallet, Plus } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Mijn balans', href: '/my/balance' }];

interface Transaction {
    id: number;
    klusje_title: string;
    role: 'vrager' | 'klusser' | 'topup';
    amount: string;
    is_income: boolean;
    status: string;
    status_label: string;
    date: string;
}

const roleLabel: Record<Transaction['role'], string> = {
    klusser: 'Ontvangen als klusser',
    vrager: 'Betaald als opdrachtgever',
    topup: 'Opwaardering van saldo',
};

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
    // Formulier setup voor het opwaarderen
    const { data, setData, post, processing } = useForm({
        amount: 50, // Standaard bedrag
    });

    const handleTopup = (e: React.FormEvent) => {
        e.preventDefault();
        post('/checkout/topup'); // Dit stuurt het bedrag naar je backend
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mijn balans" />

            <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 p-6 md:p-8">
                {/* HEADER MET OPWAARDEER ACTIE */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mijn balans</h1>
                        <p className="text-muted-foreground mt-1">Overzicht van je inkomsten, uitgaven en escrow betalingen.</p>
                    </div>

                    {/* OPWAARDEER + UITBETAAL FORMULIER */}
                    <form onSubmit={handleTopup} className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-neutral-200 shadow-sm">
                        <div className="relative flex items-center">
                            <span className="absolute left-4 font-bold text-slate-400">€</span>
                            <input
                                type="number"
                                min="5"
                                step="1"
                                required
                                value={data.amount}
                                onChange={(e) => setData('amount', Number(e.target.value))}
                                className="w-24 pl-8 pr-3 h-10 rounded-xl border-none bg-slate-50 text-slate-900 font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="h-10 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-white shadow-md shadow-orange-500/20 px-5"
                        >
                            <Plus className="mr-1 h-4 w-4" /> Opwaarderen
                        </Button>
                        <Button
                            asChild
                            type="button"
                            variant="outline"
                            className="h-10 rounded-xl border-neutral-200 px-4 font-semibold"
                        >
                            <Link href="/my/withdrawals">
                                <ArrowDownToLine className="mr-1 h-4 w-4" /> Uitbetalen
                            </Link>
                        </Button>
                    </form>
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

                <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-neutral-100 bg-slate-50/50 px-6 py-4">
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
                                <li key={tx.id} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50">
                                    <div
                                        className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                                            tx.is_income ? 'bg-green-100' : 'bg-slate-100'
                                        }`}
                                    >
                                        {tx.is_income ? (
                                            <ArrowDownLeft size={18} className="text-green-600" />
                                        ) : (
                                            <ArrowUpRight size={18} className="text-slate-500" />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-bold text-slate-900">
                                            {tx.klusje_title}
                                        </p>
                                        <p className="text-xs font-medium text-slate-500 mt-0.5">
                                            {roleLabel[tx.role]} · {tx.date}
                                        </p>
                                    </div>

                                    <span
                                        className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                            statusColors[tx.status] ?? 'bg-slate-100 text-slate-600'
                                        }`}
                                    >
                                        {tx.status_label}
                                    </span>

                                    <span
                                        className={`w-24 shrink-0 text-right text-base font-black tabular-nums ${
                                            tx.is_income ? 'text-green-600' : 'text-slate-900'
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

// ... behoud de bestaande StatCard functie hieronder ...
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
        <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm transition-transform hover:scale-105">
            <div className={`mb-3 inline-flex rounded-xl p-3 ${bgClass}`}>
                <Icon size={20} className={iconClass} />
            </div>
            <p className="text-3xl font-black text-slate-900">{value}</p>
            <p className="text-sm font-bold text-slate-700 mt-1">{label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
        </div>
    );
}