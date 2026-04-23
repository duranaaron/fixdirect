import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { home } from '@/routes';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    return (
        // 1. De achtergrond is nu een oranje gradient die het hele scherm vult
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 p-6 md:p-10">
            <div className="flex w-full max-w-md flex-col gap-6">
                {/* Logo sectie: we maken de tekst wit zodat het leesbaar is op oranje */}
                <Link
                    href={home()}
                    className="flex flex-col items-center gap-2 self-center font-bold text-white transition-transform hover:scale-105"
                >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg">
                        {/* Zorg dat je logo een kleur heeft die past, bijv. oranje of blauw */}
                        <AppLogoIcon className="size-8 fill-current text-orange-500" />
                    </div>
                    <span className="text-xl tracking-tight">FixDirect</span>
                </Link>

                <div className="flex flex-col gap-6">
                    {/* 2. De kaart krijgt rondere hoeken, geen randen en een flinke schaduw */}
                    <Card className="rounded-[2rem] border-none bg-white/95 shadow-2xl backdrop-blur-sm">
                        <CardHeader className="px-10 pt-10 pb-2 text-center">
                            <CardTitle className="text-2xl font-black text-neutral-900">
                                {title}
                            </CardTitle>
                            <CardDescription className="mt-2 text-neutral-500">
                                {description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-10 py-8">
                            {children}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
