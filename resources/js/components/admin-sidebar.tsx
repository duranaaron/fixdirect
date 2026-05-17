import { Link } from '@inertiajs/react';
import { ArrowDownToLine, Hammer, LayoutDashboard, Users } from 'lucide-react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';

const items = [
    { title: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
    { title: 'Users', href: '/admin/users', icon: Users, exact: false },
    { title: 'Klusjes', href: '/admin/klusjes', icon: Hammer, exact: false },
    { title: 'Uitbetalingen', href: '/admin/withdrawals', icon: ArrowDownToLine, exact: false },
];

export function AdminSidebar() {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <nav className="flex w-full flex-col gap-1 rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm md:w-56">
            <div className="mb-2 px-3 pt-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                Admin
            </div>
            {items.map((item) => {
                const active = item.exact
                    ? typeof window !== 'undefined' && window.location.pathname === item.href
                    : isCurrentUrl(item.href);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                            active
                                ? 'bg-orange-50 text-orange-700'
                                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                    </Link>
                );
            })}
        </nav>
    );
}
