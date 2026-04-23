import { Head } from '@inertiajs/react';
import { Star, Calendar, CheckCircle, User } from 'lucide-react';
import AppLayout from '@/layouts/app-layout'; // Let op dat dit pad klopt met jouw setup!

// Definieer hoe onze data eruitziet
type PageProps = {
    profileUser: {
        id: number;
        name: string;
        created_at: string;
        bio?: string;
    };
    completedKlusjes: Array<{
        id: number;
        title: string;
        description: string;
        budget: string;
        created_at: string;
    }>;
};

export default function UserProfile({ profileUser, completedKlusjes }: PageProps) {
    // Hardcoded review data zoals je vroeg
    const hardcodedRating = 4.8;
    const hardcodedReviewCount = 24;

    return (
        <AppLayout>
            <Head title={`Profiel van ${profileUser.name}`} />

            {/* VOLLEDIGE PAGINA ACHTERGROND MET ORANJE GRADIENT */}
            <div className="min-h-screen bg-gradient-to-br from-orange-100 via-orange-50 to-white pb-20">
                
                {/* --- HEADER SECTIE --- */}
                <div className="pt-16 pb-8 text-center px-4">
                    {/* Simpele Avatar */}
                    <div className="mx-auto h-32 w-32 bg-orange-500 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                        <User className="h-16 w-16 text-white" />
                    </div>
                    
                    <h1 className="mt-6 text-4xl font-black text-neutral-900 tracking-tight">
                        {profileUser.name}
                    </h1>

                    {/* Hardcoded Reviews */}
                    <div className="mt-4 flex items-center justify-center space-x-2 text-lg">
                        <div className="flex text-orange-500">
                            <Star className="h-6 w-6 fill-current" />
                            <Star className="h-6 w-6 fill-current" />
                            <Star className="h-6 w-6 fill-current" />
                            <Star className="h-6 w-6 fill-current" />
                            <Star className="h-6 w-6 fill-current opacity-50" /> {/* Halve ster simulatie */}
                        </div>
                        <span className="font-bold text-neutral-800">{hardcodedRating}</span>
                        <span className="text-neutral-500 font-medium">({hardcodedReviewCount} reviews)</span>
                    </div>

                    <div className="mt-4 flex items-center justify-center text-neutral-500 space-x-2">
                        <Calendar className="h-5 w-5" />
                        <span>Lid sinds {new Date(profileUser.created_at).getFullYear()}</span>
                    </div>
                </div>

                {/* --- CONTENT SECTIE: VOLTOOIDE KLUSJES --- */}
                <div className="mx-auto max-w-4xl px-4 mt-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-sm border border-orange-100">
                        <div className="flex items-center justify-between mb-8 border-b border-orange-100 pb-4">
                            <h2 className="text-2xl font-bold text-neutral-800 flex items-center gap-2">
                                <CheckCircle className="text-green-500 h-6 w-6" />
                                Reeds uitgevoerde klusjes
                            </h2>
                            <span className="bg-orange-100 text-orange-700 font-bold py-1 px-3 rounded-full">
                                {completedKlusjes.length} voltooide klusjes
                            </span>
                        </div>

                        {/* Grid met klusjes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {completedKlusjes.length > 0 ? (
                                completedKlusjes.map((klusje) => (
                                    <div key={klusje.id} className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 hover:shadow-md transition-shadow">
                                        <h3 className="text-xl font-bold text-neutral-900 mb-2 line-clamp-1">{klusje.title}</h3>
                                        <p className="text-neutral-500 text-sm mb-4 line-clamp-2">{klusje.description}</p>
                                        
                                        <div className="flex items-center justify-between pt-4 border-t border-neutral-50">
                                            <div className="flex items-center text-neutral-400 text-sm">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                {new Date(klusje.created_at).toLocaleDateString('nl-NL')}
                                            </div>
                                            <div className="font-bold text-orange-600">
                                                €{klusje.budget}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-neutral-500 italic md:col-span-2 text-center py-8">
                                    Deze gebruiker heeft nog geen klusjes voltooid.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}