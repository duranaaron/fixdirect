import { Head, Link, router, useForm } from '@inertiajs/react';
import { Calendar, Hammer, Lock, MapPin, Pencil, Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { create } from '@/routes';
import type { BreadcrumbItem, Klusje, User } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Mijn klusjes', href: '/my/klusjes' }];

type Status = 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

interface KlusjeWithAssigned extends Klusje {
    status: Status;
    assigned_klusser?: User | null;
    held_payment?: { id: number; amount: string } | null;
}

const statusMeta: Record<Status, { label: string; className: string }> = {
    open: { label: 'Open', className: 'bg-blue-50 text-blue-700' },
    assigned: { label: 'Toegewezen', className: 'bg-amber-50 text-amber-700' },
    in_progress: { label: 'Bezig', className: 'bg-purple-50 text-purple-700' },
    completed: { label: 'Voltooid', className: 'bg-green-50 text-green-700' },
    cancelled: { label: 'Geannuleerd', className: 'bg-slate-100 text-slate-600' },
};

export default function MineKlusjes({ klusjes = [] }: { klusjes?: KlusjeWithAssigned[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mijn klusjes" />

            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 md:p-8">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mijn klusjes</h1>
                        <p className="text-muted-foreground">Klusjes die jij hebt geplaatst.</p>
                    </div>
                    <Link
                        href={create().url}
                        className="inline-flex items-center gap-2 self-start rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600"
                    >
                        <Plus size={16} /> Plaats klusje
                    </Link>
                </div>

                {klusjes.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                        <Hammer className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                        <p className="text-sm text-slate-500">Je hebt nog geen klusjes geplaatst.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {klusjes.map((klusje) => (
                            <KlusjeRow key={klusje.id} klusje={klusje} />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function KlusjeRow({ klusje }: { klusje: KlusjeWithAssigned }) {
    const meta = statusMeta[klusje.status];
    const canEdit = klusje.status === 'open';
    const canComplete = klusje.status === 'assigned' || klusje.status === 'in_progress';
    const canCancel = klusje.status === 'open' || klusje.status === 'assigned' || klusje.status === 'in_progress';

    const destroy = useForm({});
    const complete = useForm({});
    const cancel = useForm({});

    const handleDelete = () => {
        if (confirm('Weet je zeker dat je dit klusje wilt verwijderen?')) {
            destroy.delete(`/jobs/${klusje.id}`);
        }
    };

    const handleComplete = () => {
        if (confirm('Markeer deze klus als voltooid?')) {
            complete.post(`/jobs/${klusje.id}/complete`);
        }
    };

    const handleCancel = () => {
        if (confirm('Weet je zeker dat je deze klus wilt annuleren?')) {
            cancel.post(`/jobs/${klusje.id}/cancel`);
        }
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge className={`${meta.className} rounded-full border-none px-3 py-0.5 text-xs font-semibold`}>
                            {meta.label}
                        </Badge>
                        <Badge className="rounded-full border-none bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-600">
                            {klusje.category}
                        </Badge>
                        {klusje.held_payment && (
                            <Badge className="rounded-full border-none bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-700">
                                <Lock size={10} className="mr-1" />
                                In escrow €{klusje.held_payment.amount}
                            </Badge>
                        )}
                    </div>
                    <button
                        onClick={() => router.visit(`/jobs/${klusje.id}`)}
                        className="text-left text-lg font-bold text-slate-900 hover:text-orange-600"
                    >
                        {klusje.title}
                    </button>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1">
                            <MapPin size={14} /> {klusje.location}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Calendar size={14} /> {new Date(klusje.date).toLocaleDateString('nl-BE')}
                        </span>
                        <span className="font-semibold text-orange-600">€{klusje.compensation}</span>
                    </div>
                    {klusje.assigned_klusser && (
                        <p className="mt-2 text-sm text-slate-600">
                            Toegewezen aan <span className="font-semibold">{klusje.assigned_klusser.name}</span>
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    {canEdit && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.visit(`/jobs/${klusje.id}/edit`)}
                        >
                            <Pencil size={14} className="mr-1" /> Bewerken
                        </Button>
                    )}
                    {canComplete && (
                        <Button variant="outline" size="sm" onClick={handleComplete} disabled={complete.processing}>
                            <CheckCircle2 size={14} className="mr-1" /> Voltooid
                        </Button>
                    )}
                    {canCancel && (
                        <Button variant="outline" size="sm" onClick={handleCancel} disabled={cancel.processing}>
                            <XCircle size={14} className="mr-1" /> Annuleer
                        </Button>
                    )}
                    {canEdit && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={handleDelete}
                            disabled={destroy.processing}
                        >
                            <Trash2 size={14} className="mr-1" /> Verwijder
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
