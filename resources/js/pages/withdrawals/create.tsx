import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Wallet } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Mijn balans', href: '/my/balance' },
    { title: 'Uitbetalingen', href: '/my/withdrawals' },
    { title: 'Nieuwe aanvraag', href: '/my/withdrawals/create' },
];

interface Props {
    available_balance: string;
    available_balance_raw: number;
}

export default function WithdrawalsCreate({ available_balance, available_balance_raw }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        amount: Math.min(available_balance_raw, 50),
        iban: '',
        account_holder: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/my/withdrawals');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nieuwe uitbetaling" />

            <div className="mx-auto flex w-full max-w-xl flex-col gap-6 p-6 md:p-8">
                <Link
                    href="/my/withdrawals"
                    className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Terug
                </Link>

                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Uitbetaling aanvragen
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Vul je gegevens in om je saldo naar je bankrekening te laten overboeken.
                    </p>
                </div>

                <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="inline-flex rounded-xl bg-orange-50 p-3">
                            <Wallet size={20} className="text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-700">Beschikbaar saldo</p>
                            <p className="text-2xl font-black text-slate-900">€{available_balance}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="amount">Bedrag (€)</Label>
                        <Input
                            id="amount"
                            type="number"
                            min={5}
                            max={available_balance_raw}
                            step="0.01"
                            required
                            value={data.amount}
                            onChange={(e) => setData('amount', Number(e.target.value))}
                        />
                        {errors.amount && <p className="text-sm text-red-600">{errors.amount}</p>}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="iban">IBAN</Label>
                        <Input
                            id="iban"
                            type="text"
                            required
                            placeholder="BE68 5390 0754 7034"
                            value={data.iban}
                            onChange={(e) => setData('iban', e.target.value)}
                        />
                        {errors.iban && <p className="text-sm text-red-600">{errors.iban}</p>}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="account_holder">Rekeninghouder</Label>
                        <Input
                            id="account_holder"
                            type="text"
                            required
                            placeholder="Volledige naam"
                            value={data.account_holder}
                            onChange={(e) => setData('account_holder', e.target.value)}
                        />
                        {errors.account_holder && <p className="text-sm text-red-600">{errors.account_holder}</p>}
                    </div>

                    <Button
                        type="submit"
                        disabled={processing || available_balance_raw < 5}
                        className="h-11 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-white shadow-md shadow-orange-500/20"
                    >
                        {processing ? 'Bezig...' : 'Verzoek indienen'}
                    </Button>

                    {available_balance_raw < 5 && (
                        <p className="text-center text-sm text-slate-500">
                            Je hebt minimaal €5 saldo nodig om een uitbetaling aan te vragen.
                        </p>
                    )}
                </form>
            </div>
        </AppLayout>
    );
}
