import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import {
    MapPin,
    Calendar,
    ChevronLeft,
    MessageSquare,
    ShieldCheck,
    User,
    Star,
    CheckCircle2,
    Hammer,
    Edit,
    Trash2
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { Klusje } from '@/types';

export default function JobDetail({ klusje }: { klusje: Klusje }) {
    const { auth } = usePage().props;
    const { post, processing } = useForm({ klusje_id: klusje.id });

    const [activeImageIndex, setActiveImageIndex] = useState(0);

    // Controleer of de ingelogde gebruiker de maker is van dit klusje
    const isOwner = auth.user && auth.user.id === klusje.user_id;

    const handleStuurBericht = () => {
        if (!auth.user) {
            window.location.href = '/login';
            return;
        }
        post('/conversations');
    };

    const handleDelete = () => {
        if (confirm('Weet je zeker dat je dit klusje definitief wilt verwijderen?')) {
            router.delete(`/jobs/${klusje.id}`);
        }
    };

    return (
        <AppLayout>
            <Head title={`${klusje?.title || 'Klus Detail'} - FixDirect`} />

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* TERUG LINK */}
                <Link
                    href="/find"
                    className="flex items-center text-sm font-medium text-neutral-500 hover:text-orange-600 transition-colors mb-8 w-fit"
                >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Terug naar klusjes
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LINKER KOLOM */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[2rem] p-8 border border-neutral-100 shadow-sm overflow-hidden">
                            {/* FOTO GALLERY SECTIE */}
                            {klusje.images && klusje.images.length > 0 ? (
                                <div className="mb-8 -mx-8 -mt-8 space-y-3 bg-neutral-50/50 pb-4">
                                    <div className="h-[450px] w-full overflow-hidden bg-neutral-100">
                                        <img
                                            src={`/storage/${klusje.images[activeImageIndex].image_path}`}
                                            alt={klusje.title}
                                            className="w-full h-full object-cover transition-all duration-500"
                                        />
                                    </div>

                                    {klusje.images.length > 1 && (
                                        <div className="flex gap-3 px-8 overflow-x-auto pb-2 scrollbar-hide">
                                            {klusje.images.map((img, index) => (
                                                <button
                                                    key={img.id}
                                                    onClick={() => setActiveImageIndex(index)}
                                                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0
                                                        ${activeImageIndex === index
                                                        ? 'border-orange-500 ring-4 ring-orange-50'
                                                        : 'border-transparent hover:border-neutral-300'}`}
                                                >
                                                    <img
                                                        src={`/storage/${img.image_path}`}
                                                        className="w-full h-full object-cover"
                                                        alt="Thumbnail"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="mb-8 -mx-8 -mt-8 h-64 bg-neutral-50 flex flex-col items-center justify-center text-neutral-400 border-b border-neutral-100">
                                    <Hammer className="h-12 w-12 mb-2 opacity-20" />
                                    <p className="text-sm font-medium">Geen foto's beschikbaar voor deze klus</p>
                                </div>
                            )}

                            <div className="flex justify-between items-center mb-6">
                                <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-none px-4 py-1.5 rounded-full font-bold">
                                    {klusje.category}
                                </Badge>
                                <Badge className="bg-green-50 text-green-600 border-none px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-[10px]">
                                    {klusje.status === 'open' ? 'Open' : klusje.status}
                                </Badge>
                            </div>

                            <h1 className="text-3xl font-black text-neutral-900 mb-6 leading-tight">
                                {klusje.title}
                            </h1>

                            <div className="flex flex-wrap gap-6 text-neutral-500 mb-6 font-medium">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-neutral-400" />
                                    <span>{klusje.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-neutral-400" />
                                    <span>{new Date(klusje.date).toLocaleDateString('nl-BE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                            </div>

                            <div className="text-3xl font-black text-orange-500 mb-8 flex items-center gap-2">
                                €{klusje.compensation}
                            </div>

                            <hr className="border-neutral-100 mb-8" />

                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-neutral-900">Omschrijving</h2>
                                <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap">
                                    {klusje.description}
                                </p>
                            </div>

                            <div className="mt-10 bg-blue-50/50 rounded-3xl p-6 border border-blue-100/50">
                                <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                                    Wat moet je weten?
                                </h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3 text-neutral-600 font-medium">
                                        <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5" />
                                        <span>Communicatie via een beveiligde chat vóór de ontmoeting.</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-neutral-600 font-medium">
                                        <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5" />
                                        <span>Betaling wordt veilig afgehandeld via het platform.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* RECHTER KOLOM */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-[2rem] p-8 border border-neutral-100 shadow-sm sticky top-24">
                            <h2 className="text-xl font-bold mb-6 text-neutral-900">Gepost door</h2>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-14 w-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 overflow-hidden border border-orange-200 shrink-0">
                                    {klusje.user?.profile_photo_path ? (
                                        <img
                                            src={`/storage/${klusje.user.profile_photo_path}`}
                                            alt={klusje.user.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <User size={28} />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-lg text-neutral-900">{klusje.user?.name ?? 'Onbekend'}</span>
                                        <ShieldCheck className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <div className="flex items-center text-sm text-neutral-500 mt-0.5">
                                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                                        <span className="font-bold text-neutral-900 mr-1">4.8</span>
                                        <span>(15 klusjes)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {isOwner ? (
                                    <>
                                        {/* AANGEPAST: De Link component is nu direct gestyled als een knop */}
                                        <Link
                                            href={`/jobs/${klusje.id}/edit`}
                                            className="flex items-center justify-center w-full h-12 rounded-2xl bg-neutral-100 text-neutral-900 hover:bg-neutral-200 font-bold transition-colors"
                                        >
                                            <Edit className="mr-2 h-4 w-4" /> Klusje bewerken
                                        </Link>

                                        <Button
                                            onClick={handleDelete}
                                            variant="outline"
                                            className="w-full h-12 rounded-2xl border-red-200 text-red-600 hover:bg-red-50 font-bold hover:text-red-700"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" /> Klusje verwijderen
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button className="w-full h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 font-bold text-white shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all">
                                            Meld je aan voor klus
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full h-12 rounded-2xl border-neutral-200 font-bold hover:bg-neutral-50 text-neutral-700"
                                            onClick={handleStuurBericht}
                                            disabled={processing}
                                        >
                                            <MessageSquare className="mr-2 h-4 w-4" /> Stuur bericht
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
