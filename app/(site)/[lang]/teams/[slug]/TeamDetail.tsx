'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Team = {
  id: string;
  slug: string;
  name_pt: string;
  name_en?: string;
  name_es?: string;
  name_fr?: string;
  logo_url: string;
};

type Match = {
  id: string;
  slug: string | null;
  match_date: string;
  match_time: string;
  home_team: { name_pt: string; logo_url: string };
  away_team: { name_pt: string; logo_url: string };
  competition?: {
    id: string;
    slug: string;
    name_pt: string;
    name_en?: string;
    name_es?: string;
    name_fr?: string;
    logo_url: string;
  };
};

const ITEMS_PER_PAGE = 12;

interface TeamDetailProps {
  lang: string;
  slug: string;
}

export default function TeamDetail({ lang, slug }: TeamDetailProps) {
  const router = useRouter();
  const currentLang = lang === 'br' ? 'pt' : lang || 'pt';

  const [team, setTeam] = useState<Team | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [showPast, setShowPast] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);

  const t = {
    pt: { future: "Partidas Futuras", past: "Partidas Anteriores", futuresBtn: "Futuras", pastBtn: "Anteriores", back: "← Voltar", noMatches: "Nenhuma partida encontrada", page: "Página", of: "de", prev: "Anterior", next: "Próxima", loadingMatches: "Carregando partidas...", loadingTeam: "Carregando detalhes do time..." },
    en: { future: "Upcoming Matches", past: "Past Matches", futuresBtn: "Upcoming", pastBtn: "Past", back: "← Back", noMatches: "No matches found", page: "Page", of: "of", prev: "Previous", next: "Next", loadingMatches: "Loading matches...", loadingTeam: "Loading team details..." },
    es: { future: "Partidos Futuros", past: "Partidos Anteriores", futuresBtn: "Futuros", pastBtn: "Anteriores", back: "← Volver", noMatches: "No se encontraron partidos", page: "Página", of: "de", prev: "Anterior", next: "Próxima", loadingMatches: "Cargando partidos...", loadingTeam: "Cargando detalles del equipo..." },
    fr: { future: "Matchs à venir", past: "Matchs passés", futuresBtn: "À venir", pastBtn: "Passés", back: "← Retour", noMatches: "Aucun match trouvé", page: "Page", of: "sur", prev: "Précédent", next: "Suivant", loadingMatches: "Chargement des matchs...", loadingTeam: "Chargement des détails de l'équipe..." },
  }[currentLang] || { future: "Partidas Futuras", past: "Partidas Anteriores", futuresBtn: "Futuras", pastBtn: "Anteriores", back: "← Voltar", noMatches: "Nenhuma partida encontrada", page: "Página", of: "de", prev: "Anterior", next: "Próxima", loadingMatches: "Carregando partidas...", loadingTeam: "Carregando detalhes do time..." };

  // Buscar time
  useEffect(() => {
    const fetchTeamData = async () => {
      if (!slug) return;
      setLoadingTeam(true);
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error || !data) {
        console.error('Time não encontrado:', error);
        router.push(`/${lang}/teams`);
        return;
      }
      setTeam(data);
      setLoadingTeam(false);
    };
    fetchTeamData();
  }, [slug, lang, router]);

  const getName = (t: Team) => {
    if (currentLang === 'pt') return t.name_pt;
    if (currentLang === 'en') return t.name_en || t.name_pt;
    if (currentLang === 'es') return t.name_es || t.name_pt;
    if (currentLang === 'fr') return t.name_fr || t.name_pt;
    return t.name_pt;
  };

  const getCompetitionName = (comp: any) => {
    if (!comp) return '';
    if (currentLang === 'pt') return comp.name_pt;
    if (currentLang === 'en') return comp.name_en || comp.name_pt;
    if (currentLang === 'es') return comp.name_es || comp.name_pt;
    if (currentLang === 'fr') return comp.name_fr || comp.name_pt;
    return comp.name_pt;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString(currentLang === 'pt' ? 'pt-BR' : currentLang, {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  const fetchMatchesForTeam = useCallback(async (teamId: string, page: number) => {
    setLoadingMatches(true);

    let query = supabase
      .from('matches')
      .select(`
        id, 
        slug,
        match_date, 
        match_time,
        home_team:teams!home_team_id(name_pt, logo_url),
        away_team:teams!away_team_id(name_pt, logo_url),
        competition:competitions!competition_id(id, slug, name_pt, name_en, name_es, name_fr, logo_url)
      `, { count: 'exact' })
      .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`);

    if (showPast) {
      query = query.order('match_date', { ascending: false }).order('match_time', { ascending: false });
    } else {
      query = query.order('match_date', { ascending: true }).order('match_time', { ascending: true });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (!showPast) {
      query = query.gte('match_date', todayStr);
    } else {
      query = query.lt('match_date', todayStr);
    }

    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, count, error } = await query.range(from, to);

    if (error) console.error('Erro ao buscar partidas:', error);

    setMatches(data || []);
    setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
    setLoadingMatches(false);
  }, [showPast]);

  useEffect(() => {
    if (team) {
      fetchMatchesForTeam(team.id, currentPage);
    }
  }, [team, currentPage, showPast, fetchMatchesForTeam]);

  if (loadingTeam) {
    return <p className="text-center py-20 text-zinc-400 bg-zinc-950 min-h-screen">{t.loadingTeam}</p>;
  }

  if (!team) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 bg-zinc-950 min-h-screen text-white">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4">
          {team.logo_url && (
            <Image 
              src={team.logo_url} 
              alt="" 
              width={70} 
              height={70} 
              className="w-14 h-14 sm:w-[70px] sm:h-[70px] rounded-2xl object-contain" 
            />
          )}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{getName(team)}</h2>
            <p className="text-sm sm:text-base text-zinc-400 mt-0.5">{showPast ? t.past : t.future}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2 sm:gap-3 w-full lg:w-auto">
          <button 
            onClick={() => { setShowPast(false); setCurrentPage(1); }} 
            className={`px-2 sm:px-6 py-3 text-xs sm:text-sm font-medium rounded-2xl transition-colors whitespace-nowrap ${!showPast ? 'bg-emerald-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'}`}
          >
            {t.futuresBtn}
          </button>
          <button 
            onClick={() => { setShowPast(true); setCurrentPage(1); }} 
            className={`px-2 sm:px-6 py-3 text-xs sm:text-sm font-medium rounded-2xl transition-colors whitespace-nowrap ${showPast ? 'bg-emerald-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'}`}
          >
            {t.pastBtn}
          </button>
          <Link 
            href={`/${lang}/teams`}
            className="px-2 sm:px-6 py-3 text-center text-xs sm:text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-2xl transition-colors whitespace-nowrap"
          >
            {t.back}
          </Link>
        </div>
      </div>

      {/* Listagem de Partidas */}
      {loadingMatches ? (
        <p className="text-center py-20 text-zinc-400">{t.loadingMatches}</p>
      ) : matches.length === 0 ? (
        <p className="text-center py-20 text-zinc-400">{t.noMatches}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {matches.map((m) => (
            <Link
              key={m.id}
              href={`/${lang}/match/${m.slug || m.id}`}
              className="bg-zinc-900 border border-zinc-800 hover:border-emerald-500 rounded-3xl p-4 sm:p-6 transition-all hover:-translate-y-1 block"
            >
              {/* Competição ao lado do card */}
              {m.competition && (
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-800">
                  {m.competition.logo_url && (
                    <Image 
                      src={m.competition.logo_url} 
                      alt="" 
                      width={24} 
                      height={24} 
                      className="w-6 h-6 object-contain" 
                    />
                  )}
                  <span className="text-xs text-emerald-400 font-medium">
                    {getCompetitionName(m.competition)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-xs text-zinc-400 mb-4">
                <span>{formatDate(m.match_date)}</span>
                <span className="font-medium bg-zinc-800 px-2 py-0.5 rounded-md">{m.match_time}</span>
              </div>
              
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 min-w-0">
                  <img src={m.home_team.logo_url} className="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0" alt="" />
                  <p className="font-semibold text-xs sm:text-sm text-white text-center sm:text-left truncate w-full">{m.home_team.name_pt}</p>
                </div>
                
                <div className="text-emerald-400 font-black text-base sm:text-xl px-2 sm:px-4 text-center select-none">VS</div>
                
                <div className="flex flex-col-reverse sm:flex-row items-center gap-2 sm:gap-3 min-w-0 justify-end">
                  <p className="font-semibold text-xs sm:text-sm text-white text-center sm:text-right truncate w-full">{m.away_team.name_pt}</p>
                  <img src={m.away_team.logo_url} className="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0" alt="" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-10 sm:mt-12 w-full">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-full sm:w-auto text-sm font-medium px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl disabled:opacity-40 transition-colors">
            {t.prev}
          </button>
          <span className="w-full sm:w-auto text-center text-xs sm:text-sm px-6 py-3 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-2xl">
            {t.page} {currentPage} {t.of} {totalPages}
          </span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-full sm:w-auto text-sm font-medium px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl disabled:opacity-40 transition-colors">
            {t.next}
          </button>
        </div>
      )}
    </div>
  );
}