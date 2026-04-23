import { Head, Link, router, useForm } from '@inertiajs/react';
import { Search, ShieldAlert, ShieldCheck, Star } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInitials } from '@/hooks/use-initials';
import AdminLayout from '@/layouts/admin-layout';
import type { BreadcrumbItem, User } from '@/types';

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Users', href: '/admin/users' },
];

export default function AdminUsersIndex({
    users,
    filters,
}: {
    users: Paginated<User>;
    filters: { search: string };
}) {
    const getInitials = useInitials();
    const [search, setSearch] = useState(filters.search ?? '');

    const apply = () => {
        router.get(
            '/admin/users',
            { search: search || undefined },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin — Users" />

            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-neutral-900">
                    Users <span className="text-sm font-normal text-neutral-500">({users.total})</span>
                </h1>
            </div>

            <div className="mb-4 flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <Input
                        className="h-10 pl-10"
                        placeholder="Zoek op naam of email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && apply()}
                    />
                </div>
                <Button onClick={apply} className="h-10">Filter</Button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
                <table className="w-full text-sm">
                    <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wider text-neutral-500">
                        <tr>
                            <th className="px-4 py-3">User</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Rating</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {users.data.map((user) => (
                            <UserRow key={user.id} user={user} getInitials={getInitials} />
                        ))}
                        {users.data.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-sm text-neutral-500">
                                    Geen gebruikers gevonden.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {users.last_page > 1 && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-1">
                    {users.links.map((link, i) => (
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

function UserRow({ user, getInitials }: { user: User; getInitials: (n: string) => string }) {
    const suspended = !!user.suspended_at;
    const suspend = useForm({});
    const unsuspend = useForm({});

    const handleSuspend = () => {
        if (confirm(`${user.name} opschorten?`)) {
            suspend.post(`/admin/users/${user.id}/suspend`, { preserveScroll: true });
        }
    };
    const handleUnsuspend = () => {
        unsuspend.post(`/admin/users/${user.id}/unsuspend`, { preserveScroll: true });
    };

    return (
        <tr className="hover:bg-neutral-50/60">
            <td className="px-4 py-3">
                <Link href={`/admin/users/${user.id}`} className="flex items-center gap-3 hover:text-orange-700">
                    <Avatar className="size-8">
                        <AvatarImage src={user.profile_photo_path ? `/storage/${user.profile_photo_path}` : undefined} />
                        <AvatarFallback className="bg-orange-100 text-xs font-semibold text-orange-700">
                            {getInitials(user.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <div className="truncate font-semibold text-neutral-900">{user.name}</div>
                        {user.is_admin && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                                Admin
                            </span>
                        )}
                    </div>
                </Link>
            </td>
            <td className="px-4 py-3 text-neutral-600">{user.email}</td>
            <td className="px-4 py-3">
                {user.rating_count && user.rating_count > 0 ? (
                    <span className="inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{Number(user.rating_avg).toFixed(1)}</span>
                        <span className="text-xs text-neutral-400">({user.rating_count})</span>
                    </span>
                ) : (
                    <span className="text-xs text-neutral-400">—</span>
                )}
            </td>
            <td className="px-4 py-3">
                {suspended ? (
                    <Badge className="rounded-full border-none bg-red-50 px-2 py-0 text-[10px] font-semibold text-red-700">
                        Opgeschort
                    </Badge>
                ) : (
                    <Badge className="rounded-full border-none bg-green-50 px-2 py-0 text-[10px] font-semibold text-green-700">
                        Actief
                    </Badge>
                )}
            </td>
            <td className="px-4 py-3 text-right">
                {suspended ? (
                    <Button size="sm" variant="outline" onClick={handleUnsuspend} disabled={unsuspend.processing}>
                        <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Activeer
                    </Button>
                ) : (
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={handleSuspend}
                        disabled={suspend.processing}
                    >
                        <ShieldAlert className="mr-1 h-3.5 w-3.5" /> Schors
                    </Button>
                )}
            </td>
        </tr>
    );
}
