import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
const JobDetail = () => {
  return (
    /* De wrapper van de hele pagina. 
      min-h-screen zorgt dat de achtergrondkleur altijd de hele pagina vult.
      bg-gray-50 is de hele lichte grijze achtergrond uit je screenshot.
    */
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900">
      
      {/* NAVBAR 
        sticky top-0 zorgt dat de balk blijft staan tijdens het scrollen.
        z-50 zorgt dat hij bovenop andere elementen ligt.
      */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo Sectie */}
          <div className="flex items-center gap-2">
            <div className="bg-[#3b82f6] text-white p-1.5 rounded-lg font-bold text-xl">FD</div>
            <span className="text-2xl font-bold tracking-tight text-[#1e293b]">FixDirect</span>
          </div>

          {/* Navigatie Links - hidden op mobiel, flex op grotere schermen */}
          <div className="hidden md:flex items-center gap-8 font-medium text-gray-600">
            <a href="#" className="flex items-center gap-2"><span className="p-1">🏠</span> Home</a>
            <a href="#" className="flex items-center gap-2 font-semibold text-gray-900 border-b-2 border-transparent hover:border-blue-500">
              <span className="p-1">📋</span> Vind klusjes
            </a>
            <a href="#" className="flex items-center gap-2"><span className="p-1">📅</span> Mijn dashboard</a>
          </div>

          {/* Actie knoppen aan de rechterkant */}
          <div className="flex items-center gap-4">
            <button className="bg-[#ff8a00] hover:bg-[#e67e00] text-white px-6 py-2.5 rounded-full font-bold transition-colors">
              + Post klusje
            </button>
            <div className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center text-gray-400">
              <User size={20} />
            </div>
          </div>
        </div>
      </nav>

      {/* HOOFD CONTENT */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* 'Terug' link */}
        <button className="flex items-center gap-1 text-[#3b82f6] font-medium mb-8 hover:underline">
          <ChevronLeft size={20} />
          Terug naar klusjes
        </button>

        {/* GRID LAYOUT 
          Op mobiel (standaard) 1 kolom. 
          Op 'lg' schermen (vanaf 1024px) 12 kolommen voor meer controle.
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LINKER KOLOM (Klus details) - neemt 8 van de 12 kolommen in */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm p-10">
              
              {/* Badges bovenin */}
              <div className="flex justify-between items-center mb-6">
                <span className="bg-[#eff6ff] text-[#3b82f6] px-5 py-2 rounded-full text-sm font-semibold">
                  Verhuizen
                </span>
                <span className="bg-[#f0fdf4] text-[#22c55e] px-4 py-1.5 rounded-full text-sm font-semibold">
                  Open
                </span>
              </div>

              {/* Titel */}
              <h1 className="text-4xl font-extrabold text-[#1e293b] mb-8">
                Help met meubels verhuizen
              </h1>

              {/* Info icons sectie */}
              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-3 text-gray-500">
                  <MapPin size={22} className="text-gray-400" />
                  <span className="text-lg">Hoogstraat, Mechelen</span>
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <Calendar size={22} className="text-gray-400" />
                  <span className="text-lg">Zondag, 25 januari, 2026</span>
                </div>
                <div className="flex items-center gap-3 text-[#ff8a00] font-bold text-2xl">
                  <Euro size={24} />
                  <span>€75</span>
                </div>
              </div>

              {/* Divider lijn */}
              <hr className="border-gray-100 mb-10" />

              {/* Beschrijving */}
              <div className="mb-10">
                <h3 className="text-xl font-bold mb-4 text-[#1e293b]">Omschrijving</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Hulp nodig bij het verhuizen van een zetel en een eettafel van mijn appartement naar een opslagruimte. 
                  Zwaar tilwerk vereist. Ongeveer 2–3 uur werk.
                </p>
              </div>

              {/* Blauwe Info Box */}
              <div className="bg-[#f8fbff] border border-[#eef2ff] rounded-2xl p-8">
                <h4 className="text-lg font-bold mb-6">Wat moet je weten?</h4>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-gray-600">
                    <CheckCircle2 size={22} className="text-[#3b82f6] mt-0.5 shrink-0" />
                    <span>Communicatie via een beveiligde chat vóór de ontmoeting.</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-600">
                    <CheckCircle2 size={22} className="text-[#3b82f6] mt-0.5 shrink-0" />
                    <span>Betaling wordt veilig afgehandeld via het platform.</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-600">
                    <CheckCircle2 size={22} className="text-[#3b82f6] mt-0.5 shrink-0" />
                    <span>Beoordeel je ervaring na afronding van de taak.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* RECHTER KOLOM (Sidebar) - neemt 4 van de 12 kolommen in */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Poster Kaart */}
            <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm p-8 text-center sm:text-left">
              <h3 className="text-xl font-bold mb-6">Gepost door</h3>
              
              <div className="flex items-center gap-4 mb-8">
                {/* Gebruiker Avatar */}
                <div className="w-16 h-16 bg-[#3b82f6] rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-100">
                  <User size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-lg">
                    John Doe <ShieldCheck size={18} className="text-[#3b82f6]" />
                  </div>
                  <div className="text-gray-500">
                    <span className="text-[#ff8a00] font-bold">★ 4.8</span> 
                    <span className="text-sm ml-1">(15 klusjes)</span>
                  </div>
                  <div className="text-[#3b82f6] text-xs font-semibold mt-1">✓ Geverifieerde Klusser</div>
                </div>
              </div>

              {/* Call-to-actions */}
              <button className="w-full bg-[#ff8a00] hover:bg-[#e67e00] text-white font-bold py-4 rounded-2xl mb-4 transition-all active:scale-95 shadow-md shadow-orange-100">
                Meld je aan voor klus
              </button>
              <button className="w-full bg-white border border-gray-200 text-gray-800 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all active:scale-95">
                <MessageSquare size={20} />
                Stuur bericht
              </button>
            </div>

            {/* Veiligheidstips Kaart */}
            <div className="bg-[#f8fbff] border border-[#eef2ff] rounded-[2rem] p-8">
              <h3 className="text-xl font-bold mb-6">Veiligheids tips</h3>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <Shield size={24} className="text-[#3b82f6] shrink-0" />
                  <span className="text-gray-600 text-sm leading-relaxed">Communiceer altijd via het platform</span>
                </li>
                <li className="flex gap-4">
                  <Shield size={24} className="text-[#3b82f6] shrink-0" />
                  <span className="text-gray-600 text-sm leading-relaxed">Ontmoet elkaar op openbare plaatsen</span>
                </li>
                <li className="flex gap-4">
                  <Shield size={24} className="text-[#3b82f6] shrink-0" />
                  <span className="text-gray-600 text-sm leading-relaxed">Vertrouw je instincten</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDetail;