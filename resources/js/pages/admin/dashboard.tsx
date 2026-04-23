import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Hammer, Lock, TrendingUp, UserCheck, Users, XOctagon } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import type { BreadcrumbItem } from '@/types';

interface Stats {
    userCount: number;
    suspendedCount: number;
    activeKlusjeCount: number;
    completedThisMonth: number;
    escrowHeldTotal: number;
    platformFeeThisMonth: number;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Admin', href: '/admin' }];

export default function AdminDashboard({ stats }: { stats: Stats }) {
    const currency = (n: number) =>
        `€${n.toFixed(2).replace('.', ',')}`;

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin — Dashboard" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Admin dashboard</h1>
                    <p className="text-sm text-neutral-500">Overzicht van gebruikers, klusjes en escrow.</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <StatTile icon={Users} tint="orange" label="Gebruikers" value={stats.userCount.toLocaleString('nl-BE')} />
                    <StatTile icon={XOctagon} tint="red" label="Opgeschort" value={stats.suspendedCount.toLocaleString('nl-BE')} />
                    <StatTile icon={Hammer} tint="blue" label="Actieve klusjes" value={stats.activeKlusjeCount.toLocaleString('nl-BE')} />
                    <StatTile icon={UserCheck} tint="green" label="Voltooid deze maand" value={stats.completedThisMonth.toLocaleString('nl-BE')} />
                    <StatTile icon={Lock} tint="amber" label="In escrow" value={currency(stats.escrowHeldTotal)} />
                    <StatTile icon={TrendingUp} tint="emerald" label="Platform fees deze maand" value={currency(stats.platformFeeThisMonth)} />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <QuickLink href="/admin/users" label="Users beheren" description="Zoek, bekijk en schors gebruikers" />
                    <QuickLink href="/admin/klusjes" label="Klusjes beheren" description="Filter, inspecteer en annuleer klusjes" />
                </div>
            </div>
        </AdminLayout>
    );
}

const tints = {
    orange: 'bg-orange-50 text-orange-700',
    red: 'bg-red-50 text-red-700',
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
} as const;

function StatTile({
    icon: Icon,
    label,
    value,
    tint,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    tint: keyof typeof tints;
}) {
    return (
        <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <div className={`rounded-xl p-2 ${tints[tint]}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">{label}</div>
                    <div className="truncate text-xl font-black text-neutral-900">{value}</div>
                </div>
            </div>
        </div>
    );
}

function QuickLink({ href, label, description }: { href: string; label: string; description: string }) {
    return (
        <Link
            href={href}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm transition-colors hover:border-orange-200 hover:bg-orange-50/30"
        >
            <div>
                <div className="font-bold text-neutral-900 group-hover:text-orange-700">{label}</div>
                <div className="text-xs text-neutral-500">{description}</div>
            </div>
            <ArrowRight className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:text-orange-600" />
        </Link>
    );
}
