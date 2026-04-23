import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
};

export default function ResetPassword({ token, email }: Props) {
    return (
        <AuthLayout
            title="Wachtwoord herstellen"
            description="Vul hieronder je nieuwe wachtwoord in om weer toegang te krijgen."
        >
            <Head title="Wachtwoord herstellen" />

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
            >
                {({ processing, errors }) => (
                    <div className="mt-4 grid gap-6">
                        {/* EMAIL VELD (Alleen-lezen) */}
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
                                autoComplete="email"
                                value={email}
                                className="cursor-not-allowed rounded-xl border-neutral-200 bg-neutral-50 text-neutral-500"
                                readOnly
                            />
                            <InputError
                                message={errors.email}
                                className="mt-2"
                            />
                        </div>

                        {/* NIEUW WACHTWOORD */}
                        <div className="grid gap-2">
                            <Label
                                htmlFor="password"
                                className="font-semibold text-neutral-700"
                            >
                                Nieuw wachtwoord
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                autoComplete="new-password"
                                className="rounded-xl border-neutral-200 focus:border-orange-500 focus:ring-orange-500"
                                autoFocus
                                placeholder="••••••••"
                            />
                            <InputError message={errors.password} />
                        </div>

                        {/* BEVESTIG WACHTWOORD */}
                        <div className="grid gap-2">
                            <Label
                                htmlFor="password_confirmation"
                                className="font-semibold text-neutral-700"
                            >
                                Bevestig wachtwoord
                            </Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                autoComplete="new-password"
                                className="rounded-xl border-neutral-200 focus:border-orange-500 focus:ring-orange-500"
                                placeholder="Bevestig je nieuwe wachtwoord"
                            />
                            <InputError
                                message={errors.password_confirmation}
                                className="mt-2"
                            />
                        </div>

                        {/* SUBMIT KNOP */}
                        <Button
                            type="submit"
                            className="mt-4 h-12 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:from-orange-600 hover:to-orange-700 active:scale-[0.98]"
                            disabled={processing}
                            data-test="reset-password-button"
                        >
                            {processing && <Spinner className="mr-2" />}
                            Wachtwoord instellen
                        </Button>
                    </div>
                )}
            </Form>
        </AuthLayout>
    );
}
