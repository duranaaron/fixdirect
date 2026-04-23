import { useForm } from '@inertiajs/react';
import { Star, X, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';

type ReviewModalProps = {
    isOpen: boolean;
    onClose: () => void;
    klusjeId: number;
    revieweeId: number;
    revieweeName: string;
};

export default function ReviewModal({
    isOpen,
    onClose,
    klusjeId,
    revieweeId,
    revieweeName,
}: ReviewModalProps) {
    const [hoverRating, setHoverRating] = useState(0);

    // Inertia form setup
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            reviewee_id: revieweeId,
            rating: 0,
            comment: '',
        });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Stuur de data naar onze ReviewController route
        post(`/klusjes/${klusjeId}/reviews`, {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const closeModal = () => {
        reset();
        clearErrors();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md animate-in rounded-[2rem] bg-white p-6 shadow-2xl zoom-in-95 fade-in">
                {/* Modal Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-black text-neutral-900">
                        Review voor {revieweeName}
                    </h2>
                    <button
                        onClick={closeModal}
                        className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Interactieve Sterren */}
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-sm font-semibold text-neutral-700">
                            Hoe was je ervaring?
                        </p>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setData('rating', star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="transition-transform hover:scale-110 focus:outline-none active:scale-90"
                                >
                                    <Star
                                        className={`h-10 w-10 ${
                                            star <= (hoverRating || data.rating)
                                                ? 'fill-orange-500 text-orange-500'
                                                : 'fill-neutral-100 text-neutral-200'
                                        } transition-colors duration-200`}
                                    />
                                </button>
                            ))}
                        </div>
                        <InputError message={errors.rating} className="mt-1" />
                    </div>

                    {/* Tekstvak voor feedback */}
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="comment"
                            className="text-sm font-semibold text-neutral-700"
                        >
                            Geschreven feedback (optioneel)
                        </label>
                        <textarea
                            id="comment"
                            rows={4}
                            className="w-full resize-none rounded-2xl border border-neutral-200 p-4 text-sm transition-all outline-none focus:border-orange-500 focus:ring-orange-500"
                            placeholder={`Vertel anderen hoe het was om met ${revieweeName} te werken...`}
                            value={data.comment}
                            onChange={(e) => setData('comment', e.target.value)}
                        />
                        <InputError message={errors.comment} className="mt-1" />
                    </div>

                    {/* Foutmelding voor als je jezelf probeert te reviewen */}
                    {(errors as Record<string, string>).error && (
                        <div className="rounded-xl bg-red-50 p-3 text-center text-sm font-medium text-red-500">
                            {(errors as Record<string, string>).error}
                        </div>
                    )}

                    {/* Verzendknop */}
                    <Button
                        type="submit"
                        disabled={processing || data.rating === 0}
                        className="h-12 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] disabled:opacity-50"
                    >
                        {processing ? (
                            <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                        ) : null}
                        Review plaatsen
                    </Button>
                </form>
            </div>
        </div>
    );
}
