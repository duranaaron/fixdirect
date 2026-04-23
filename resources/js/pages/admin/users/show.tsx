import { Head, Link, useForm } from '@inertiajs/react';
import { MapPin, ShieldAlert, ShieldCheck, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';
import AdminLayout from '@/layouts/admin-layout';
import type { BreadcrumbItem, User } from '@/types';

interface KlusjeSummary {
    id: number;
    title: string;
    status: string;
    created_at: string;
}
interface OfferSummary {
    id: number;
    klusje_id: number;
    status: string;
    created_at: string;
}
interface ReviewSummary {
    id: number;
    rating: number;
    comment: string | null;
    created_at: string;
    from_user: { id: number; name: string };
    klusje: { id: number; title: string };
}

type Profile = User & {
    klusjes: KlusjeSummary[];
    offers: OfferSummary[];
    reviews_received: ReviewSummary[];
};

export default function AdminUserShow({ profile }: { profile: Profile }) {
    const getInitials = useInitials();
    const suspended = !!profile.suspended_at;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Users', href: '/admin/users' },
        { title: profile.name, href: `/admin/users/${profile.id}` },
    ];

    const suspend = useForm({});
    const unsuspend = useForm({});

    const handleToggle = () => {
        if (suspended) {
            unsuspend.post(`/admin/users/${profile.id}/unsuspend`, { preserveScroll: true });
        } else if (confirm(`${profile.name} opschorten?`)) {
            suspend.post(`/admin/users/${profile.id}/suspend`, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Admin — ${profile.name}`} />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar className="size-16">
                            <AvatarImage src={profile.profile_photo_path ? `/storage/${profile.profile_photo_path}` : undefined} />
                            <AvatarFallback className="bg-orange-100 text-lg font-semibold text-orange-700">
                                {getInitials(profile.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-neutral-900">{profile.name}</h1>
                                {profile.is_admin && (
                                    <Badge className="rounded-full border-none bg-orange-100 px-2 py-0 text-[10px] font-bold uppercase tracking-wider text-orange-700">
                                        Admin
                                    </Badge>
                                )}
                                {suspended ? (
                                    <Badge className="rounded-full border-none bg-red-50 px-2 py-0 text-[10px] font-semibold text-red-700">
                                        Opgeschort
                                    </Badge>
                                ) : (
                                    <Badge className="rounded-full border-none bg-green-50 px-2 py-0 text-[10px] font-semibold text-green-700">
                                        Actief
                                    </Badge>
                                )}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
                                <span>{profile.email}</span>
                                {profile.location && (
                                    <span className="inline-flex items-center gap-1">
                                        <MapPin size={12} /> {profile.location}
                                    </span>
                                )}
                                {profile.rating_count && profile.rating_count > 0 ? (
                                    <span className="inline-flex items-center gap-1">
                                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                        <span className="font-semibold text-neutral-900">
                                            {Number(profile.rating_avg).toFixed(1)}
                                        </span>
                                        <span className="text-xs">({profile.rating_count})</span>
                                    </span>
                                ) : null}
                            </div>
                            {profile.bio && (
                                <p className="mt-2 max-w-xl text-sm text-neutral-600">{profile.bio}</p>
                            )}
                        </div>
                    </div>
                    {!profile.is_admin && (
                        <Button
                            variant={suspended ? 'outline' : 'default'}
                            onClick={handleToggle}
                            disabled={suspend.processing || unsuspend.processing}
                            className={suspended ? '' : 'bg-red-500 hover:bg-red-600'}
                        >
                            {suspended ? (
                                <>
                                    <ShieldCheck className="mr-2 h-4 w-4" /> Activeer account
                                </>
                            ) : (
                                <>
                                    <ShieldAlert className="mr-2 h-4 w-4" /> Schors account
                                </>
                            )}
                        </Button>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Panel title={`Geplaatste klusjes (${profile.klusjes.length})`}>
                        {profile.klusjes.length === 0 ? (
                            <EmptyMini text="Nog geen klusjes geplaatst." />
                        ) : (
                            <ul className="divide-y divide-neutral-100">
                                {profile.klusjes.map((k) => (
                                    <li key={k.id} className="flex items-center justify-between py-2 text-sm">
                                        <Link href={`/admin/klusjes/${k.id}`} className="hover:text-orange-700">
                                            {k.title}
                                        </Link>
                                        <span className="text-xs text-neutral-500">{k.status}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Panel>

                    <Panel title={`Biedingen (${profile.offers.length})`}>
                        {profile.offers.length === 0 ? (
                            <EmptyMini text="Nog geen biedingen." />
                        ) : (
                            <ul className="divide-y divide-neutral-100">
                                {profile.offers.map((o) => (
                                    <li key={o.id} className="flex items-center justify-between py-2 text-sm">
                                        <Link href={`/admin/klusjes/${o.klusje_id}`} className="hover:text-orange-700">
                                            Klusje #{o.klusje_id}
                                        </Link>
                                        <span className="text-xs text-neutral-500">{o.status}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Panel>
                </div>

                <Panel title={`Reviews ontvangen (${profile.reviews_received?.length ?? 0})`}>
                    {!profile.reviews_received?.length ? (
                        <EmptyMini text="Nog geen reviews." />
                    ) : (
                        <ul className="space-y-3">
                            {profile.reviews_received.map((r) => (
                                <li key={r.id} className="rounded-xl bg-neutral-50 p-3 text-sm">
                                    <div className="mb-1 flex items-center gap-2">
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <Star
                                                    key={n}
                                                    size={12}
                                                    className={n <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'}
                                                />
                                            ))}
                                        </div>
                                        <span className="font-semibold">{r.from_user.name}</span>
                                        <span className="text-xs text-neutral-500">voor &ldquo;{r.klusje.title}&rdquo;</span>
                                    </div>
                                    {r.comment && <p className="text-neutral-700">{r.comment}</p>}
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>
            </div>
        </AdminLayout>
    );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-bold text-neutral-900">{title}</h2>
            {children}
        </section>
    );
}

function EmptyMini({ text }: { text: string }) {
    return <p className="py-4 text-center text-xs text-neutral-400">{text}</p>;
}
