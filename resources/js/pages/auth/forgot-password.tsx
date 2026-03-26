import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <AuthLayout
            title="Wachtwoord vergeten?"
            description="Vul je e-mailadres in om een herstellink te ontvangen."
        >
            <Head title="Wachtwoord vergeten" />

            {/* SUCCES MELDING */}
            {status && (
                <div className="mb-6 rounded-xl border border-green-100 bg-green-50 p-4 text-center text-sm font-medium text-green-700">
                    {status}
                </div>
            )}

            <div className="mt-4 space-y-6">
                <Form {...email.form()}>
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="font-semibold text-neutral-700"
                                >
                                    E-mailadres
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="off"
                                    autoFocus
                                    placeholder="naam@voorbeeld.be"
                                    className="rounded-xl border-neutral-200 focus:border-orange-500 focus:ring-orange-500"
                                />

                                <InputError message={errors.email} />
                            </div>

                            <div className="my-6 flex items-center justify-start">
                                <Button
                                    className="h-12 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:from-orange-600 hover:to-orange-700 active:scale-[0.98]"
                                    disabled={processing}
                                    data-test="email-password-reset-link-button"
                                >
                                    {processing && (
                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Wachtwoord herstellink sturen
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="text-center text-sm text-neutral-500">
                    <span>Of ga terug naar </span>
                    <TextLink
                        href={login()}
                        className="font-bold text-orange-600 hover:underline"
                    >
                        inloggen
                    </TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}
