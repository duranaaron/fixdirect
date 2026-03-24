import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { useState } from 'react';
import type { BreadcrumbItem } from '@/types';
import {
    Calendar as CalendarIcon,
    List,
    ChevronRight,
    ChevronLeft,
    Hammer, 
    HandHelping, 
    TrendingUp,
} from 'lucide-react';

/** --- TYPES --- */
interface Job {
    id: number;
    title: string;
    date: string; // 'YYYY-MM-DD' format
    status: string;
    price: string;
    rol: 'doener' | 'vrager';
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: dashboard().url }];

export default function Dashboard({ klusjes = [] }: { klusjes?: Job[] }) {
    const [view, setView] = useState<'calendar' | 'list'>('calendar');
    
    // --- KALENDER LOGICA ---
    const [currentMonth, setCurrentMonth] = useState(new Date()); 

    const goToPreviousMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    const goToNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

    const monthNames = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
    const currentMonthName = monthNames[currentMonth.getMonth()];
    const currentYear = currentMonth.getFullYear();

    const daysInMonth = new Date(currentYear, currentMonth.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth.getMonth(), 1).getDay();
    const emptyDaysOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 

    const today = new Date();

    // --- STATISTIEKEN BEREKENEN ---
    const doenerCount = klusjes.filter(j => j.rol === 'doener').length;
    const vragerCount = klusjes.filter(j => j.rol === 'vrager').length;

    const parsePrice = (price: string): number => {
        return parseFloat(price.replace('€', '').replace('.', '').replace(',', '.')) || 0;
    };

    const doenerTotal = klusjes.filter(j => j.rol === 'doener').reduce((sum, j) => sum + parsePrice(j.price), 0);
    const vragerTotal = klusjes.filter(j => j.rol === 'vrager').reduce((sum, j) => sum + parsePrice(j.price), 0);
    const saldo = doenerTotal - vragerTotal;
    const saldoFormatted = `${saldo >= 0 ? '+' : '-'} €${Math.abs(saldo).toFixed(2).replace('.', ',')}`;


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6 md:p-8">
                {/* HEADER & TOGGLE */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mijn dashboard</h1>
                        <p className="text-muted-foreground">Onderscheid tussen jouw werk en jouw aanvragen.</p>
                    </div>

                    <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                        <button onClick={() => setView('calendar')} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${view === 'calendar' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
                            <CalendarIcon size={16} /> Kalender
                        </button>
                        <button onClick={() => setView('list')} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${view === 'list' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
                            <List size={16} /> Lijst
                        </button>
                    </div>
                </div>

                {/* STATISTIEKEN */}
                <div className="grid gap-4 md:grid-cols-3">
                    <StatCard icon={Hammer} title="Uit te voeren (Doener)" value={String(doenerCount)} colorClass="bg-orange-50" iconColor="text-orange-600" subtext="Inkomsten genereren" />
                    <StatCard icon={HandHelping} title="Hulp krijgen (Vrager)" value={String(vragerCount)} colorClass="bg-violet-50" iconColor="text-violet-600" subtext="Uitgaven" />
                    <StatCard icon={TrendingUp} title="Saldo" value={saldoFormatted} colorClass="bg-slate-50" iconColor="text-slate-700" subtext="Netto resultaat" />
                </div>

                {/* HOOFDCONTENT */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {view === 'calendar' ? (
                        /* --- KALENDER WEERGAVE --- */
                        <div className="p-6">
                            <header className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                                <div className="flex items-center gap-4">
                                    <h3 className="w-36 text-xl font-bold text-slate-900">
                                        {currentMonthName} {currentYear}
                                    </h3>
                                    <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
                                        <button onClick={goToPreviousMonth} className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">
                                            <ChevronLeft size={20} />
                                        </button>
                                        <div className="mx-1 h-4 w-px bg-slate-200"></div>
                                        <button onClick={goToNextMonth} className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => setCurrentMonth(new Date())} 
                                        className="text-xs font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-slate-900"
                                    >
                                        Vandaag
                                    </button>
                                </div>

                                <div className="flex gap-4">
                                    <LegendItem color="bg-orange-500" label="Doener (Werken)" />
                                    <LegendItem color="bg-violet-500" label="Vrager (Hulp nodig)" />
                                </div>
                            </header>

                            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
                                <div className="grid grid-cols-7 bg-slate-50">
                                    {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map(d => (
                                        <div key={d} className="py-3 text-center text-xs font-bold uppercase tracking-widest text-slate-500">
                                            {d}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-px">
                                    {Array.from({ length: emptyDaysOffset }).map((_, i) => (
                                        <div key={`empty-${i}`} className="min-h-[100px] bg-slate-50/50 p-2"></div>
                                    ))}

                                    {Array.from({ length: daysInMonth }).map((_, i) => {
                                        const dayNum = i + 1;
                                        const dateString = `${currentYear}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                                        const dayJobs = klusjes.filter((j: Job) => j.date === dateString);
                                        const isToday = dayNum === today.getDate() && currentMonth.getMonth() === today.getMonth() && currentYear === today.getFullYear();

                                        return (
                                            <div key={dayNum} className={`min-h-[100px] bg-white p-2 transition-colors hover:bg-slate-50 ${isToday ? 'ring-2 ring-inset ring-slate-900' : ''}`}>
                                                <div className="mb-1 flex justify-end">
                                                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${isToday ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>
                                                        {dayNum}
                                                    </span>
                                                </div>

                                                <div className="flex flex-col gap-1">
                                                    {dayJobs.map((job: Job) => (
                                                        <div 
                                                            key={job.id} 
                                                            className={`cursor-pointer truncate rounded px-2 py-1.5 text-[10px] font-bold uppercase tracking-tight transition-all hover:opacity-80
                                                                ${job.rol === 'doener' ? 'bg-orange-100 text-orange-800' : 'bg-violet-100 text-violet-800'}
                                                            `}
                                                            title={job.title} 
                                                        >
                                                            {job.title}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* --- LIJST WEERGAVE --- */
                        <div className="flex flex-col divide-y divide-slate-100">
                            <ListSection 
                                title="Uit te voeren (Jij werkt)" 
                                icon={Hammer} 
                                role="doener" 
                                jobs={klusjes.filter((j: Job) => j.date.startsWith(`${currentYear}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`))} 
                                colorClass="text-orange-700" 
                                bgClass="bg-orange-50/50" 
                            />
                            <ListSection 
                                title="Hulp krijgen (Anderen werken voor jou)" 
                                icon={HandHelping} 
                                role="vrager" 
                                jobs={klusjes.filter((j: Job) => j.date.startsWith(`${currentYear}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`))} 
                                colorClass="text-violet-700" 
                                bgClass="bg-violet-50/50" 
                            />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

/** --- HELPER COMPONENTS --- */
const StatCard = ({ icon: Icon, title, value, colorClass, iconColor, subtext }: any) => (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className={`rounded-xl p-3 ${colorClass} ${iconColor}`}><Icon size={24} /></div>
        <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{title}</p>
            <p className="text-2xl font-black text-slate-900">{value}</p>
            {subtext && <p className="text-[10px] font-medium text-slate-400">{subtext}</p>}
        </div>
    </div>
);

const LegendItem = ({ color, label }: { color: string; label: string }) => (
    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-tight text-slate-500">
        <div className={`h-3 w-3 rounded-sm ${color}`}></div>
        <span>{label}</span>
    </div>
);

const ListSection = ({ title, icon: Icon, role, jobs, colorClass, bgClass }: any) => {
    return (
        <div>
            <div className={`${bgClass} flex items-center justify-between px-6 py-4`}>
                <h3 className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${colorClass}`}>
                    <Icon size={16} /> {title}
                </h3>
            </div>
            <div className="p-2">
                {jobs.length > 0 ? jobs.map((job: Job) => (
                    <div key={job.id} className="group flex cursor-pointer items-center justify-between rounded-xl p-4 transition-all hover:bg-slate-50">
                        <div className="flex items-center gap-4">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white shadow-sm ${role === 'doener' ? 'bg-orange-100 text-orange-600' : 'bg-violet-100 text-violet-600'}`}>
                                <Icon size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">{job.title}</h4>
                                <p className="text-xs text-slate-500">{job.date} • {job.status}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <p className={`text-sm font-black ${role === 'doener' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                {role === 'doener' ? '+' : '-'} {job.price}
                            </p>
                            <ChevronRight size={18} className="text-slate-300 transition-colors group-hover:text-slate-900" />
                        </div>
                    </div>
                )) : <p className="p-6 text-center text-xs font-medium italic text-slate-400">Geen geplande taken voor deze maand.</p>}
            </div>
        </div>
    );
};