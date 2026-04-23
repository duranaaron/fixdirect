import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    return (
        <AuthLayout
            title="Bevestig je wachtwoord"
            description="Dit is een beveiligd gedeelte van FixDirect. Bevestig je wachtwoord om door te gaan."
        >
            <Head title="Wachtwoord bevestigen" />

            <Form {...store.form()} resetOnSuccess={['password']}>
                {({ processing, errors }) => (
                    <div className="mt-4 space-y-6">
                        <div className="grid gap-2">
                            <Label
                                htmlFor="password"
                                className="font-semibold text-neutral-700"
                            >
                                Wachtwoord
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                autoFocus
                                className="rounded-xl border-neutral-200 focus:border-orange-500 focus:ring-orange-500"
                            />

                            <InputError message={errors.password} />
                        </div>

                        <div className="flex items-center">
                            <Button
                                className="h-12 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:from-orange-600 hover:to-orange-700 active:scale-[0.98]"
                                disabled={processing}
                                data-test="confirm-password-button"
                            >
                                {processing && <Spinner className="mr-2" />}
                                Wachtwoord bevestigen
                            </Button>
                        </div>
                    </div>
                )}
            </Form>
        </AuthLayout>
    );
}
