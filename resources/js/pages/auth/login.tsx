import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <AuthLayout
            title="Welkom terug!"
            description="Log in om je klusjes te beheren of nieuwe hulp te vinden"
        >
            <Head title="Log in" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            {/* Email veld */}
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
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    className="rounded-xl border-neutral-200 focus:border-orange-500 focus:ring-orange-500"
                                    placeholder="naam@voorbeeld.be"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Wachtwoord veld */}
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label
                                        htmlFor="password border-neutral-200"
                                        className="font-semibold text-neutral-700"
                                    >
                                        Wachtwoord
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm text-orange-600 hover:text-orange-700"
                                            tabIndex={5}
                                        >
                                            Wachtwoord vergeten?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    className="rounded-xl border-neutral-200 focus:border-orange-500 focus:ring-orange-500"
                                    placeholder="••••••••"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* Remember me & Button */}
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="text-orange-500 focus:ring-orange-500"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-sm text-neutral-600"
                                >
                                    Onthoud mij
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 h-12 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:from-orange-600 hover:to-orange-700 active:scale-[0.98]"
                                tabIndex={4}
                                disabled={processing}
                            >
                                {processing ? (
                                    <Spinner className="mr-2" />
                                ) : null}
                                Inloggen
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-center text-sm text-neutral-500">
                                Nog geen account?{' '}
                                <TextLink
                                    href={register()}
                                    className="font-bold text-orange-600 hover:underline"
                                    tabIndex={5}
                                >
                                    Account aanmaken
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>
            {/* ... status message */}
        </AuthLayout>
    );
}
