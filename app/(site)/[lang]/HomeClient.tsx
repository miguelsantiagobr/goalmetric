'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Banners from '@/components/Banners';

interface HomeClientProps {
  lang: string;
  currentLang: string;
  initialMatches: any[];
}

export default function HomeClient({ lang, currentLang, initialMatches }: HomeClientProps) {
  const [search, setSearch] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Verifica autenticação
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setLoadingAuth(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const formatMatchDate = (dateString: string | undefined) => {
    if (!dateString) return 'Data não disponível';
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const getName = (obj: any, base: string) => {
    if (!obj) return '';
    return obj[`${base}_${currentLang}`] || obj[`${base}_pt`] || obj[base] || '';
  };

  const getText = (obj: any, baseField: string) => {
    if (!obj) return '';
    return obj[`${baseField}_${currentLang}`] || obj[`${baseField}_pt`] || obj[baseField] || '';
  };

const sortedMatches = [...initialMatches].sort((a, b) => {
  const dateA = new Date(
    `${a.match_date}T${a.match_time || '00:00:00'}`
  );

  const dateB = new Date(
    `${b.match_date}T${b.match_time || '00:00:00'}`
  );

  return dateA.getTime() - dateB.getTime();
});

const filteredMatches = sortedMatches.filter(m => 
    getName(m.home_team, 'name').toLowerCase().includes(search.toLowerCase()) ||
    getName(m.away_team, 'name').toLowerCase().includes(search.toLowerCase())
  );

  const handleLockedClick = () => {
    window.location.href = `/${lang}/login`;
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-12">
        
        {/* Header + Busca */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h1 className="text-6xl font-bold tracking-tighter">GolMetric</h1>
            <p className="text-zinc-400 mt-3 text-xl">
              {currentLang === 'pt' ? 'Análises profissionais de futebol' : 
               currentLang === 'en' ? 'Professional Football Analysis' : 
               currentLang === 'es' ? 'Análisis profesional de fútbol' : 
               'Analyse professionnelle de football'}
            </p>
          </div>

          <input
            type="text"
            placeholder={
              currentLang === 'pt' ? "Buscar partida ou time..." : 
              currentLang === 'en' ? "Search match or team..." :
              currentLang === 'es' ? "Buscar partido o equipo..." : 
              "Rechercher match ou équipe..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-6 md:mt-0 bg-zinc-900 border border-zinc-700 rounded-full px-6 py-4 w-full md:w-96 focus:border-emerald-500 focus:outline-none transition"
          />
        </div>

        {filteredMatches.length === 0 ? (
          <p className="text-center py-20 text-zinc-500 text-xl">Nenhuma partida encontrada.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {filteredMatches.map((match) => (
              <Link
                key={match.id}
                href={`/${lang}/match/${match.slug}`}
                className="group bg-zinc-900 border border-zinc-800 hover:border-emerald-500 rounded-3xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10 relative"
              >
                <div className="p-7">
                  {/* Data e Hora */}
                  <div className="flex justify-between text-xs text-zinc-400 mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatMatchDate(match.match_date)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" /> {match.match_time}
                    </div>
                  </div>

                  {/* Times */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex-1 flex flex-col items-center text-center">
                      {match.home_team?.logo_url && (
                        <img src={match.home_team.logo_url} className="w-16 h-16 object-contain drop-shadow-xl" alt={`Logo da seleção ${getText(match.home_team, 'name')}`} />
                      )}
                      <p className="font-semibold text-lg">{getName(match.home_team, 'name')}</p>
                    </div>

                    <div className="text-center px-6">
                      <div className="text-2xl font-black text-emerald-400">VS</div>
                      {match.predicted_score && isLoggedIn && (
                        <p className="text-6xl font-black text-emerald-400 tracking-tighter">{match.predicted_score?.replace(/\s*x\s*/gi, ' × ')}</p>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col items-center text-center">
                      {match.away_team?.logo_url && (
                        <img src={match.away_team.logo_url} className="w-16 h-16 object-contain drop-shadow-xl" alt={`Logo da seleção ${getText(match.away_team, 'name')}`} />
                      )}
                      <p className="font-semibold text-lg">{getName(match.away_team, 'name')}</p>
                    </div>
                  </div>

                  {/* Melhor Aposta + Overlay */}
                  <div className="relative min-h-[110px]">
<p className="text-zinc-400 text-center mt-3 text-xl">
              {currentLang === 'pt' ? 'Melhor Aposta:' : 
               currentLang === 'en' ? 'Best Bet' : 
               currentLang === 'es' ? 'Mejor Apuesta' : 
               currentLang === 'fr' ? 'Meilleur Pari' :
               'Best Bet'}
            </p>
                    <div className={`text-2xl text-emerald-400 text-center leading-relaxed transition-all ${!isLoggedIn ? 'blur-sm select-none' : ''}`}>
                      {getText(match, 'best_bet') || 
                       (currentLang === 'pt' ? "Análise completa disponível após login" : 
                        currentLang === 'en' ? "Full analysis available after login" : 
                        "Análisis completo disponible después del login")}
                    </div>

                    {/* Overlay Melhorado */}
                    {!isLoggedIn && (
                      <div 
                        onClick={handleLockedClick}
                        className="absolute inset-0 flex items-center justify-center bg-zinc-950/95 backdrop-blur-xl rounded-2xl cursor-pointer border border-emerald-500/20 hover:border-emerald-500/40 transition-all"
                      >
                        <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left px-6">
                          <Image 
                            src="/cadeado.png" 
                            alt="Bloqueado" 
                            width={58} 
                            height={58}
                            className="opacity-90"
                          />
                          <div>
                            
                            <p className="text-zinc-400 text-sm">
                              {currentLang === 'pt' ? 'Faça login para ver as previsões' : 
                               currentLang === 'en' ? 'Sign in to view predictions' : 
                               currentLang === 'es' ? 'Inicia sesión para ver las predicciones' : 
                               currentLang === 'fr' ? 'Connectez-vous pour voir les prédictions' : 
                               'Sign in to view predictions'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400" />
              </Link>
            ))}
          </div>
        )}

        {/* Banners */}
       <div className="mt-16 max-w-[350px] mx-auto">
  <Banners position="sidebar" />
</div>
      </div>
    </div>
  );
}