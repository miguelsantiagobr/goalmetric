'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
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

const ITEMS_PER_PAGE = 20;

export default function TeamsClient() {
  const params = useParams();
  const lang = params.lang as string;
  const currentLang = lang === 'br' ? 'pt' : lang || 'pt';

  const [teams, setTeams] = useState<Team[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const t = {
    pt: {
      title: "Times",
      subtitle: "Busque ou escolha um time para ver suas partidas e análises",
      searchPlaceholder: "Digite o nome do time...",
      loadingTeams: "Carregando times...",
      noResults: "Nenhum time encontrado para esta busca.",
      page: "Página",
      of: "de",
      prev: "Anterior",
      next: "Próxima",
    },
    en: {
      title: "Teams",
      subtitle: "Search or choose a team to see their matches and analyses",
      searchPlaceholder: "Type the team name...",
      loadingTeams: "Loading teams...",
      noResults: "No team found for this search.",
      page: "Page",
      of: "of",
      prev: "Previous",
      next: "Next",
    },
    es: {
      title: "Equipos",
      subtitle: "Busca o elige un equipo para ver sus partidos y análisis",
      searchPlaceholder: "Escribe el nombre del equipo...",
      loadingTeams: "Cargando equipos...",
      noResults: "No se encontró ningún equipo.",
      page: "Página",
      of: "de",
      prev: "Anterior",
      next: "Próxima",
    },
    fr: {
      title: "Équipes",
      subtitle: "Recherchez ou choisissez une équipe pour voir ses matchs et analyses",
      searchPlaceholder: "Tapez le nom de l'équipe...",
      loadingTeams: "Chargement des équipes...",
      noResults: "Aucune équipe trouvée.",
      page: "Page",
      of: "sur",
      prev: "Précédent",
      next: "Suivant",
    },
  }[currentLang] || {
    title: "Times",
    subtitle: "Busque ou escolha um time para ver suas partidas e análises",
    searchPlaceholder: "Digite o nome do time...",
    loadingTeams: "Carregando times...",
    noResults: "Nenhum time encontrado para esta busca.",
    page: "Página",
    of: "de",
    prev: "Anterior",
    next: "Próxima",
  };

  // Buscar todos os times
  useEffect(() => {
    const fetchTeams = async () => {
      const { data } = await supabase
        .from('teams')
        .select('id, slug, name_pt, name_en, name_es, name_fr, logo_url')
        .order('name_pt');
      setTeams(data || []);
      setLoading(false);
    };
    fetchTeams();
  }, []);

  // Resetar para página 1 quando o usuário pesquisar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getName = (team: Team) => {
    if (currentLang === 'pt') return team.name_pt;
    if (currentLang === 'en') return team.name_en || team.name_pt;
    if (currentLang === 'es') return team.name_es || team.name_pt;
    if (currentLang === 'fr') return team.name_fr || team.name_pt;
    return team.name_pt;
  };

  // Filtrar times pela busca
  const filteredTeams = searchTerm.trim()
    ? teams.filter((team) =>
        getName(team).toLowerCase().includes(searchTerm.toLowerCase().trim())
      )
    : teams;

  // Paginação
  const totalPages = Math.ceil(filteredTeams.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTeams = filteredTeams.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 bg-zinc-950 min-h-screen text-white">
      <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t.title}</h1>
      <p className="text-zinc-400 mb-8 sm:mb-10 text-sm sm:text-base">{t.subtitle}</p>

      {/* Campo de Pesquisa */}
      <div className="mb-8 max-w-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-2xl text-white placeholder:text-zinc-500 outline-none transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-center py-20 text-zinc-400">{t.loadingTeams}</p>
      ) : filteredTeams.length === 0 ? (
        <p className="text-center py-20 text-zinc-400">{t.noResults}</p>
      ) : (
        <>
          {/* Grid de Times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {paginatedTeams.map((team) => (
              <Link
                key={team.id}
                href={`/${lang}/teams/${team.slug}`}
                className="bg-zinc-900 border border-zinc-800 hover:border-emerald-500 rounded-3xl p-6 sm:p-8 cursor-pointer transition-all hover:-translate-y-1.5 group block"
              >
                <div className="flex flex-col items-center text-center">
                  {team.logo_url && (
                    <Image
                      src={team.logo_url}
                      alt={team.name_pt}
                      width={90}
                      height={90}
                      className="w-16 h-16 sm:w-[90px] sm:h-[90px] mb-4 sm:mb-6 group-hover:scale-105 transition-transform object-contain"
                    />
                  )}
                  <h3 className="text-lg sm:text-xl font-bold group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {getName(team)}
                  </h3>
                  <p className="text-emerald-500 text-xs sm:text-sm mt-3 sm:mt-4 flex items-center gap-2 font-medium">
                    Ver partidas e análises <ArrowRight className="w-4 h-4" />
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-10 sm:mt-12 w-full">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-full sm:w-auto text-sm font-medium px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl disabled:opacity-40 disabled:hover:bg-zinc-800 transition-colors"
              >
                {t.prev}
              </button>

              <span className="w-full sm:w-auto text-center text-xs sm:text-sm px-6 py-3 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-2xl">
                {t.page} {currentPage} {t.of} {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-full sm:w-auto text-sm font-medium px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl disabled:opacity-40 disabled:hover:bg-zinc-800 transition-colors"
              >
                {t.next}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}