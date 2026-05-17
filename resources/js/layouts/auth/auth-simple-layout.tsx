import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

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
                    <div className="flex flex-col items-center">
                        <Link
                            href={home()}
                            className="flex flex-col items-center font-bold text-neutral-900"
                        >
                            <AppLogoIcon className="size-16" />
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
