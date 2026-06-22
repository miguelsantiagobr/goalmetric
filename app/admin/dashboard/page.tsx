// app/admin/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Calendar, Users, Trophy, Target, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    matchesToday: 0,
    totalTeams: 0,
    totalUsers: 0,
    totalAnalyses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadStats() {
    try {
      setLoading(true);
      setError(null);

      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      const [
        { count: matchesToday },
        { count: totalTeams },
        { count: totalUsers },
        { count: totalAnalyses },
      ] = await Promise.all([
        // Partidas de hoje
        supabase
          .from('matches')
          .select('*', { count: 'exact', head: true })
          .gte('match_date', today)
          .lt('match_date', tomorrow),

        // Total de times
        supabase
          .from('teams')
          .select('*', { count: 'exact', head: true }),

        // Total de usuários (tabela correta)
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true }),

        // Análises publicadas
        supabase
          .from('matches')
          .select('*', { count: 'exact', head: true })
          .not('analysis_pt', 'is', null),
      ]);

      setStats({
        matchesToday: matchesToday || 0,
        totalTeams: totalTeams || 0,
        totalUsers: totalUsers || 0,
        totalAnalyses: totalAnalyses || 0,
      });
    } catch (err: any) {
      console.error("Erro ao carregar estatísticas:", err);
      setError("Não foi possível carregar os dados. Verifique as permissões (RLS).");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-white">
        Carregando dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-center py-12">
        {error}
        <button
          onClick={loadStats}
          className="mt-6 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-2xl flex items-center gap-2 mx-auto transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Dashboard</h1>
          <p className="text-zinc-400">Visão geral em tempo real do GoalMetric</p>
        </div>

        <button
          onClick={loadStats}
          className="flex items-center gap-2 px-5 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-2xl text-sm font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar agora
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 hover:border-emerald-500/30 transition-all">
          <Calendar className="w-10 h-10 text-emerald-400 mb-6" />
          <p className="text-6xl font-bold text-white">{stats.matchesToday}</p>
          <p className="text-zinc-400 mt-2 text-lg">PARTIDAS HOJE</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 hover:border-blue-500/30 transition-all">
          <Trophy className="w-10 h-10 text-blue-400 mb-6" />
          <p className="text-6xl font-bold text-white">{stats.totalTeams}</p>
          <p className="text-zinc-400 mt-2 text-lg">TIMES CADASTRADOS</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 hover:border-violet-500/30 transition-all">
          <Users className="w-10 h-10 text-violet-400 mb-6" />
          <p className="text-6xl font-bold text-white">{stats.totalUsers}</p>
          <p className="text-zinc-400 mt-2 text-lg">USUÁRIOS</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 hover:border-amber-500/30 transition-all">
          <Target className="w-10 h-10 text-amber-400 mb-6" />
          <p className="text-6xl font-bold text-white">{stats.totalAnalyses}</p>
          <p className="text-zinc-400 mt-2 text-lg">ANÁLISES PUBLICADAS</p>
        </div>
      </div>
    </div>
  );
}