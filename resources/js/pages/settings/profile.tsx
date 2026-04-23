import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInitials } from '@/hooks/use-initials';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage().props as unknown as {
        auth: {
            user: {
                id: number;
                name: string;
                email: string;
                email_verified_at: string | null;
                profile_photo_path?: string | null;
                bio?: string | null;
                location?: string | null;
                phone?: string | null;
            } | null;
        };
    };

    const user = auth.user;
    const getInitials = useInitials();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        _method: 'PATCH',
        name: user?.name ?? '',
        email: user?.email ?? '',
        bio: user?.bio ?? '',
        location: user?.location ?? '',
        phone: user?.phone ?? '',
        avatar: null as File | null,
    });

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('avatar', file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/settings/profile', { forceFormData: true, preserveScroll: true });
    };

    if (!user) return null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile Settings</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Profile information"
                        description="Update your public profile"
                    />

                    <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                        <div className="grid gap-2">
                            <Label>Profile photo</Label>
                            <div className="flex items-center gap-4">
                                <Avatar className="size-16">
                                    <AvatarImage
                                        src={
                                            avatarPreview ??
                                            (user.profile_photo_path ? `/storage/${user.profile_photo_path}` : undefined)
                                        }
                                    />
                                    <AvatarFallback className="bg-neutral-200 text-black">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                    Kies foto
                                </Button>
                            </div>
                            <InputError className="mt-2" message={errors.avatar} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="Full name"
                            />
                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />
                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="location">Stad / regio</Label>
                            <Input
                                id="location"
                                value={data.location}
                                onChange={(e) => setData('location', e.target.value)}
                                placeholder="Bv. Antwerpen"
                            />
                            <InputError className="mt-2" message={errors.location} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone">Telefoonnummer</Label>
                            <Input
                                id="phone"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="+32 ..."
                            />
                            <InputError className="mt-2" message={errors.phone} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="bio">Over jou</Label>
                            <textarea
                                id="bio"
                                rows={4}
                                value={data.bio}
                                onChange={(e) => setData('bio', e.target.value)}
                                placeholder="Vertel iets over jezelf, je ervaring of je vaardigheden..."
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <InputError className="mt-2" message={errors.bio} />
                        </div>

                        {mustVerifyEmail && user.email_verified_at === null && (
                            <div>
                                <p className="-mt-4 text-sm text-muted-foreground">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={send()}
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current!"
                                    >
                                        Click here to resend the verification email.
                                    </Link>
                                </p>
                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing} data-test="update-profile-button">
                                Save
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
