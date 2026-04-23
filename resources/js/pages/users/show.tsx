import { Head } from '@inertiajs/react';
import { MapPin, Star, Calendar, Hammer, HandHelping, type LucideIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Profile {
    id: number;
    name: string;
    bio: string | null;
    location: string | null;
    profile_photo_path: string | null;
    rating_avg: string | null;
    rating_count: number;
    completed_as_klusser: number;
    posted_count: number;
    member_since: string;
}

interface Review {
    id: number;
    rating: number;
    comment: string | null;
    created_at: string;
    from_user: { id: number; name: string; profile_photo_path: string | null };
    klusje: { id: number; title: string };
}

export default function UserProfile({ profile, reviews }: { profile: Profile; reviews: Review[] }) {
    const getInitials = useInitials();
    const breadcrumbs: BreadcrumbItem[] = [{ title: profile.name, href: `/users/${profile.id}` }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${profile.name} - FixDirect`} />

            <div className="mx-auto max-w-4xl p-6 md:p-8">
                <div className="mb-6 rounded-[2rem] border border-neutral-100 bg-white p-8 shadow-sm">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start">
                        <Avatar className="size-24">
                            <AvatarImage
                                src={profile.profile_photo_path ? `/storage/${profile.profile_photo_path}` : undefined}
                            />
                            <AvatarFallback className="bg-neutral-200 text-xl text-black">
                                {getInitials(profile.name)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-neutral-900">{profile.name}</h1>
                            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-neutral-600">
                                {profile.location && (
                                    <span className="inline-flex items-center gap-1">
                                        <MapPin size={14} /> {profile.location}
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1">
                                    <Calendar size={14} /> Lid sinds {profile.member_since}
                                </span>
                                {profile.rating_count > 0 && (
                                    <span className="inline-flex items-center gap-1">
                                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                        <span className="font-semibold text-neutral-900">
                                            {Number(profile.rating_avg).toFixed(1)}
                                        </span>
                                        <span>({profile.rating_count})</span>
                                    </span>
                                )}
                            </div>
                            {profile.bio && <p className="mt-4 text-neutral-700">{profile.bio}</p>}
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4 border-t border-neutral-100 pt-6 md:grid-cols-3">
                        <StatCard icon={HandHelping} label="Klusjes geplaatst" value={profile.posted_count} />
                        <StatCard icon={Hammer} label="Klussen voltooid" value={profile.completed_as_klusser} />
                        <StatCard icon={Star} label="Reviews" value={profile.rating_count} />
                    </div>
                </div>

                <div className="rounded-[2rem] border border-neutral-100 bg-white p-8 shadow-sm">
                    <h2 className="mb-4 text-xl font-bold text-neutral-900">Reviews</h2>
                    {reviews.length === 0 ? (
                        <p className="text-sm text-neutral-500">Nog geen reviews.</p>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <div key={review.id} className="flex gap-3 border-b border-neutral-100 pb-4 last:border-0">
                                    <Avatar className="size-10 shrink-0">
                                        <AvatarImage
                                            src={
                                                review.from_user.profile_photo_path
                                                    ? `/storage/${review.from_user.profile_photo_path}`
                                                    : undefined
                                            }
                                        />
                                        <AvatarFallback className="bg-neutral-200 text-black">
                                            {getInitials(review.from_user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="mb-1 flex flex-wrap items-center gap-2">
                                            <span className="font-semibold text-neutral-900">{review.from_user.name}</span>
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map((n) => (
                                                    <Star
                                                        key={n}
                                                        size={12}
                                                        className={
                                                            n <= review.rating
                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                : 'text-neutral-300'
                                                        }
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-xs text-neutral-400">
                                                {new Date(review.created_at).toLocaleDateString('nl-BE')}
                                            </span>
                                        </div>
                                        <p className="text-xs text-neutral-500">voor &ldquo;{review.klusje.title}&rdquo;</p>
                                        {review.comment && (
                                            <p className="mt-1 text-sm text-neutral-700">{review.comment}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
    return (
        <div className="flex items-center gap-3 rounded-xl bg-neutral-50 p-4">
            <div className="rounded-lg bg-white p-2 shadow-sm">
                <Icon size={18} className="text-orange-500" />
            </div>
            <div>
                <p className="text-2xl font-bold text-neutral-900">{value}</p>
                <p className="text-xs text-neutral-500">{label}</p>
            </div>
        </div>
    );
}
