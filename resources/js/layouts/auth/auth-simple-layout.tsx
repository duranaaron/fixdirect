import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import type { AuthLayoutProps } from '@/types';
import { home } from '@/routes';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        // 1. Dezelfde oranje gradient achtergrond
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 p-6 md:p-10">
            {/* 2. Een subtiel transparant wit vlak voor leesbaarheid */}
            <div className="w-full max-w-sm rounded-[2.5rem] bg-white/90 p-8 shadow-xl backdrop-blur-md">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-bold text-neutral-900"
                        >
                            <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-md">
                                <AppLogoIcon className="size-7 fill-current text-white" />
                            </div>
                            <span className="text-xl">FixDirect</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-black text-neutral-900">
                                {title}
                            </h1>
                            <p className="text-center text-sm font-medium text-neutral-500">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
