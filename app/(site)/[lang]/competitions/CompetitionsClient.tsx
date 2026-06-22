'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Competition = {
  id: string;
  slug: string;
  name_pt: string;
  name_en?: string;
  name_es?: string;
  name_fr?: string;
  logo_url: string;
};

export default function CompetitionsClient() {
  const params = useParams();
  const lang = params.lang as string;
  const currentLang = lang === 'br' ? 'pt' : lang || 'pt';

  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  const t = {
    pt: { title: "Competições", subtitle: "Escolha uma competição para ver as análises disponíveis", loadingComps: "Carregando competições..." },
    en: { title: "Competitions", subtitle: "Choose a competition to see available analyses", loadingComps: "Loading competitions..." },
    es: { title: "Competiciones", subtitle: "Elige una competición para ver los análisis disponíveis", loadingComps: "Cargando competiciones..." },
    fr: { title: "Compétitions", subtitle: "Choisissez une compétition para voir les analyses disponibles", loadingComps: "Chargement des compétitions..." },
  }[currentLang] || { title: "Competições", subtitle: "Escolha uma competição para ver as análises disponíveis", loadingComps: "Carregando competições..." };

  useEffect(() => {
    const fetchCompetitions = async () => {
      const { data } = await supabase
        .from('competitions')
        .select('id, slug, name_pt, name_en, name_es, name_fr, logo_url')
        .order('name_pt');
      setCompetitions(data || []);
      setLoading(false);
    };
    fetchCompetitions();
  }, []);

  const getName = (comp: Competition) => {
    if (currentLang === 'pt') return comp.name_pt;
    if (currentLang === 'en') return comp.name_en || comp.name_pt;
    if (currentLang === 'es') return comp.name_es || comp.name_pt;
    if (currentLang === 'fr') return comp.name_fr || comp.name_pt;
    return comp.name_pt;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 bg-zinc-950 min-h-screen text-white">
      <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t.title}</h1>
      <p className="text-zinc-400 mb-8 sm:mb-10 text-sm sm:text-base">{t.subtitle}</p>

      {loading ? (
        <p className="text-center py-20 text-zinc-400">{t.loadingComps}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {competitions.map((comp) => (
            <Link
              key={comp.id}
              href={`/${lang}/competitions/${comp.slug}`}
              className="bg-zinc-900 border border-zinc-800 hover:border-emerald-500 rounded-3xl p-6 sm:p-8 cursor-pointer transition-all hover:-translate-y-1.5 group block"
            >
              <div className="flex flex-col items-center text-center">
                {comp.logo_url && (
                  <Image 
                    src={comp.logo_url} 
                    alt={comp.name_pt} 
                    width={90} 
                    height={90} 
                    className="w-16 h-16 sm:w-[90px] sm:h-[90px] mb-4 sm:mb-6 group-hover:scale-105 transition-transform object-contain" 
                  />
                )}
                <h3 className="text-lg sm:text-xl font-bold group-hover:text-emerald-400 transition-colors line-clamp-2">
                  {getName(comp)}
                </h3>
                <p className="text-emerald-500 text-xs sm:text-sm mt-3 sm:mt-4 flex items-center gap-2 font-medium">
                  Ver análises <ArrowRight className="w-4 h-4" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}