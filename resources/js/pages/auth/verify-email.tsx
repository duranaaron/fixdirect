import { Form, Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <AuthLayout
            title="Verifieer je e-mailadres"
            description="Welkom bij FixDirect! Klik op de link die we je zojuist hebben gemaild om je account te activeren."
        >
            <Head title="E-mail verificatie" />

            {/* SUCCES MELDING */}
            {status === 'verification-link-sent' && (
                <div className="mb-6 rounded-xl border border-green-100 bg-green-50 p-4 text-center text-sm font-medium text-green-700">
                    Een nieuwe verificatielink is gestuurd naar het e-mailadres
                    dat je tijdens de registratie hebt opgegeven.
                </div>
            )}

            <Form {...send.form()} className="mt-6 space-y-6 text-center">
                {({ processing }) => (
                    <div className="flex flex-col gap-4">
                        {/* OPNIEUW STUREN KNOP */}
                        <Button
                            disabled={processing}
                            className="h-12 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:from-orange-600 hover:to-orange-700 active:scale-[0.98]"
                        >
                            {processing && <Spinner className="mr-2" />}
                            Verificatie e-mail opnieuw sturen
                        </Button>

                        {/* UITLOGGEN LINK */}
                        <TextLink
                            href={logout()}
                            className="mx-auto mt-2 block text-sm font-semibold text-neutral-500 transition-colors hover:text-orange-600"
                        >
                            Uitloggen
                        </TextLink>
                    </div>
                )}
            </Form>
        </AuthLayout>
    );
}
