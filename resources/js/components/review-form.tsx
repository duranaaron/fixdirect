import { useForm } from '@inertiajs/react';
import { Star } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ReviewFormProps {
    klusjeId: number;
    toUserId: number;
    toUserName: string;
}

export default function ReviewForm({ klusjeId, toUserId, toUserName }: ReviewFormProps) {
    const { data, setData, post, processing, errors, wasSuccessful } = useForm({
        to_user_id: toUserId,
        rating: 5,
        comment: '',
    });
    const [hoverRating, setHoverRating] = useState<number | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/jobs/${klusjeId}/reviews`, { preserveScroll: true });
    };

    if (wasSuccessful) {
        return (
            <div className="rounded-2xl border border-green-100 bg-green-50 p-4 text-sm text-green-900">
                Bedankt voor je review!
            </div>
        );
    }

    const displayRating = hoverRating ?? data.rating;

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-5"
        >
            <div>
                <h3 className="text-sm font-bold text-neutral-900">Laat een review achter</h3>
                <p className="text-xs text-neutral-500">voor {toUserName}</p>
            </div>

            <div>
                <label className="mb-2 block text-xs font-semibold text-neutral-700">Hoe was de ervaring?</label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <button
                            key={n}
                            type="button"
                            onClick={() => setData('rating', n)}
                            onMouseEnter={() => setHoverRating(n)}
                            onMouseLeave={() => setHoverRating(null)}
                            className="rounded p-0.5 transition-transform hover:scale-110"
                            aria-label={`${n} sterren`}
                        >
                            <Star
                                size={24}
                                className={
                                    n <= displayRating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-neutral-300'
                                }
                            />
                        </button>
                    ))}
                </div>
                {errors.rating && <p className="mt-1 text-xs text-red-500">{errors.rating}</p>}
            </div>

            <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-700">Commentaar (optioneel)</label>
                <textarea
                    rows={3}
                    value={data.comment}
                    onChange={(e) => setData('comment', e.target.value)}
                    placeholder="Deel je ervaring..."
                    className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
                {errors.comment && <p className="mt-1 text-xs text-red-500">{errors.comment}</p>}
            </div>

            <Button type="submit" disabled={processing} className="w-full bg-orange-500 hover:bg-orange-600">
                {processing ? 'Versturen...' : 'Plaats review'}
            </Button>
        </form>
    );
}
