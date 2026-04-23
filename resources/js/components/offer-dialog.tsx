import { useForm } from '@inertiajs/react';
import { Hammer, X } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface OfferDialogProps {
    open: boolean;
    onClose: () => void;
    klusjeId: number;
    klusjeTitle: string;
    defaultCompensation: string;
}

export default function OfferDialog({
    open,
    onClose,
    klusjeId,
    klusjeTitle,
    defaultCompensation,
}: OfferDialogProps) {
    const { data, setData, post, processing, errors, reset, wasSuccessful } = useForm({
        klusje_id: klusjeId,
        message: '',
        proposed_compensation: defaultCompensation,
    });

    useEffect(() => {
        if (wasSuccessful) {
            reset('message', 'proposed_compensation');
            onClose();
        }
    }, [wasSuccessful, reset, onClose]);

    useEffect(() => {
        if (!open) {
            reset('message', 'proposed_compensation');
        }
    }, [open, reset]);

    if (!open) {
        return null;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/offers', { preserveScroll: true });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-orange-100 p-2 text-orange-600">
                            <Hammer size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-neutral-900">Meld je aan</h2>
                            <p className="text-xs text-neutral-500">{klusjeTitle}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                        aria-label="Sluiten"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-neutral-700">
                            Je bericht (optioneel)
                        </label>
                        <textarea
                            rows={4}
                            value={data.message}
                            onChange={(e) => setData('message', e.target.value)}
                            placeholder="Vertel waarom jij de beste kandidaat bent..."
                            className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                        />
                        {errors.message && <p className="text-xs text-red-500">{errors.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-neutral-700">
                            Jouw prijsvoorstel (optioneel)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">€</span>
                            <input
                                type="number"
                                step="0.01"
                                value={data.proposed_compensation}
                                onChange={(e) => setData('proposed_compensation', e.target.value)}
                                placeholder={defaultCompensation}
                                className="h-11 w-full rounded-2xl border border-neutral-200 bg-neutral-50 pl-8 pr-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                            />
                        </div>
                        {errors.proposed_compensation && (
                            <p className="text-xs text-red-500">{errors.proposed_compensation}</p>
                        )}
                        <p className="text-xs text-neutral-400">
                            Laat leeg om akkoord te gaan met de voorgestelde vergoeding.
                        </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                            disabled={processing}
                        >
                            Annuleren
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="flex-1 bg-orange-500 hover:bg-orange-600"
                        >
                            {processing ? 'Versturen...' : 'Verstuur aanmelding'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
