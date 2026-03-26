import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout'; // Of AuthCardLayout als je die naam gebruikt
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    return (
        <AuthLayout
            title="Word een Fixer"
            description="Maak een account aan en begin direct met klussen"
        >
            <Head title="Registreren" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            {/* NAAM VELD */}
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="name"
                                    className="font-semibold text-neutral-700"
                                >
                                    Naam
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Je volledige naam"
                                    className="rounded-xl border-neutral-200 focus:border-orange-500 focus:ring-orange-500"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            {/* EMAIL VELD */}
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
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="naam@voorbeeld.be"
                                    className="rounded-xl border-neutral-200 focus:border-orange-500 focus:ring-orange-500"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* WACHTWOORD VELD */}
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
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="••••••••"
                                    className="rounded-xl border-neutral-200 focus:border-orange-500 focus:ring-orange-500"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* WACHTWOORD BEVESTIGEN VELD */}
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
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Bevestig je wachtwoord"
                                    className="rounded-xl border-neutral-200 focus:border-orange-500 focus:ring-orange-500"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                    className="mt-2"
                                />
                            </div>

                            {/* SUBMIT KNOP */}
                            <Button
                                type="submit"
                                className="mt-2 h-12 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:from-orange-600 hover:to-orange-700 active:scale-[0.98]"
                                tabIndex={5}
                                data-test="register-user-button"
                                disabled={processing}
                            >
                                {processing && <Spinner className="mr-2" />}
                                Account aanmaken
                            </Button>
                        </div>

                        {/* LINK NAAR LOGIN */}
                        <div className="text-center text-sm text-neutral-500">
                            Heb je al een account?{' '}
                            <TextLink
                                href={login()}
                                tabIndex={6}
                                className="font-bold text-orange-600 hover:underline"
                            >
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
