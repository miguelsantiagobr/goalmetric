'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, Target } from 'lucide-react';

export default function MatchDetail() {
  const { id, lang } = useParams();
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Define o idioma atual
  const currentLang = lang === 'br' ? 'pt' : lang || 'pt';

  useEffect(() => {
    const fetchMatch = async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!home_team_id (*),
          away_team:teams!away_team_id (*),
          competition:competitions (*)
        `)
        .eq('id', id)
        .single();

      if (error) console.error(error);
      setMatch(data);
      setLoading(false);
    };

    fetchMatch();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-2xl">Carregando...</div>;
  if (!match) return <div className="min-h-screen flex items-center justify-center text-3xl text-red-400">Partida não encontrada</div>;

  // Função robusta para pegar texto no idioma correto
  const getText = (obj: any, baseField: string) => {
    if (!obj) return 'Não informado';
    
    const fields = [
      `${baseField}_${currentLang}`,
      `${baseField}_pt`,
      `${baseField}_en`,
      baseField,
      `${baseField}_pt` // fallback final
    ];

    for (const field of fields) {
      if (obj[field] && obj[field].trim() !== '') {
        return obj[field];
      }
    }
    return 'Não informado';
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚽</span>
            <h1 className="text-2xl font-bold">GolMetric</h1>
          </div>
          <nav className="flex gap-8 text-sm font-medium">
            <a href={`/${lang}`} className="hover:text-emerald-400">Início</a>
            <a href={`/${lang}`} className="text-emerald-400">Partidas</a>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Competição */}
        <div className="text-center mb-10">
          {match.competition?.logo_url && <img src={match.competition.logo_url} className="h-16 mx-auto mb-4" />}
          <p className="text-emerald-400 text-xl font-medium">
            {getText(match.competition, 'name')}
          </p>
        </div>

        {/* Times */}
        <div className="flex items-center justify-between max-w-4xl mx-auto mb-12">
          <div className="flex-1 text-center">
            {match.home_team?.logo_url && <img src={match.home_team.logo_url} className="w-28 h-28 mx-auto mb-6" />}
            <p className="text-3xl font-bold text-white">{getText(match.home_team, 'name')}</p>
          </div>

          <div className="text-center px-12">
            <div className="text-7xl font-black text-emerald-400">VS</div>
            {match.predicted_score && <p className="text-5xl font-bold text-emerald-400 mt-2">{match.predicted_score}</p>}
          </div>

          <div className="flex-1 text-center">
            {match.away_team?.logo_url && <img src={match.away_team.logo_url} className="w-28 h-28 mx-auto mb-6" />}
            <p className="text-3xl font-bold text-white">{getText(match.away_team, 'name')}</p>
          </div>
        </div>

        {/* Data */}
        <div className="flex justify-center gap-8 text-zinc-400 mb-12">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {new Date(match.match_date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {match.match_time} • Brasília
          </div>
        </div>

        {/* Melhor Aposta */}
        <div className="bg-gradient-to-br from-emerald-900 to-teal-900 border border-emerald-500 rounded-3xl p-10 text-center mb-12">
          <Target className="w-12 h-12 mx-auto mb-4 text-emerald-300" />
          <h2 className="text-3xl font-bold text-white mb-4">🎯 Melhor Aposta</h2>
          <p className="text-xl text-emerald-100">
            {getText(match, 'best_bet')}
          </p>
        </div>

        {/* Estatísticas */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-8">Estatísticas Esperadas</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div className="bg-gradient-to-br from-blue-900 to-blue-700 border border-blue-500 rounded-3xl p-8 text-center">
              <p className="text-blue-200 text-sm">Gols 1º Tempo</p>
              <p className="text-5xl font-bold text-white mt-4">{match.first_half_goals_pct}%</p>
            </div>
            <div className="bg-gradient-to-br from-purple-900 to-purple-700 border border-purple-500 rounded-3xl p-8 text-center">
              <p className="text-purple-200 text-sm">Ambos Marcam</p>
              <p className="text-5xl font-bold text-white mt-4">{match.both_teams_score_pct}%</p>
            </div>
            <div className="bg-gradient-to-br from-amber-900 to-orange-700 border border-amber-500 rounded-3xl p-8 text-center">
              <p className="text-amber-200 text-sm">Gols Esperados</p>
              <p className="text-5xl font-bold text-white mt-4">{match.expected_goals}</p>
            </div>
            <div className="bg-gradient-to-br from-red-900 to-rose-700 border border-red-500 rounded-3xl p-8 text-center">
              <p className="text-red-200 text-sm">Cartões Médios</p>
              <p className="text-5xl font-bold text-white mt-4">{match.cards_avg}</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-900 to-teal-700 border border-cyan-500 rounded-3xl p-8 text-center">
              <p className="text-cyan-200 text-sm">Escanteios Médios</p>
              <p className="text-5xl font-bold text-white mt-4">{match.corners_avg}</p>
            </div>
          </div>
        </div>

        {/* Análise */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-10">
          <h2 className="text-2xl font-bold mb-6">📋 Análise da Partida</h2>
          <p className="text-zinc-300 leading-relaxed whitespace-pre-line text-[17px]">
            {getText(match, 'analysis')}
          </p>
        </div>
      </div>
    </div>
  );
}