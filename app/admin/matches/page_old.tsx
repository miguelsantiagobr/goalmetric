'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Pencil, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

interface Competition { id: string; name_pt: string; }
interface Team { id: string; name_pt: string; logo_url?: string; }

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  const [form, setForm] = useState({
    match_date: '',
    match_time: '',
    competition_id: '',
    home_team_id: '',
    away_team_id: '',
    
    predicted_score: '',           // ← Previsão de Placar

    // Análises multilíngue
    analysis_pt: '',
    analysis_en: '',
    analysis_es: '',
    analysis_fr: '',

    // Melhor Aposta multilíngue
    best_bet_pt: '',
    best_bet_en: '',
    best_bet_es: '',
    best_bet_fr: '',

    // Estatísticas
    first_half_goals_pct: 50,
    both_teams_score_pct: 55,
    expected_goals: 2.8,
    cards_avg: 4.5,
    corners_avg: 9.8,

    // Jogador destaque (apenas um campo)
    key_player: '',
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    const [compRes, teamRes, matchRes] = await Promise.all([
      supabase.from('competitions').select('id, name_pt'),
      supabase.from('teams').select('id, name_pt, logo_url'),
      supabase.from('matches').select('*').order('match_date', { ascending: false })
    ]);

    setCompetitions(compRes.data || []);
    setTeams(teamRes.data || []);
    setMatches(matchRes.data || []);
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (editingId) {
        const { error } = await supabase.from('matches').update(form).eq('id', editingId);
        if (error) throw error;
        setMessage({ type: 'success', text: '✅ Partida atualizada com sucesso!' });
      } else {
        const { error } = await supabase.from('matches').insert(form);
        if (error) throw error;
        setMessage({ type: 'success', text: '✅ Partida cadastrada com sucesso!' });
      }

      // Reset form
      setForm({
        match_date: '', match_time: '', competition_id: '', home_team_id: '', away_team_id: '',
        predicted_score: '',
        analysis_pt: '', analysis_en: '', analysis_es: '', analysis_fr: '',
        best_bet_pt: '', best_bet_en: '', best_bet_es: '', best_bet_fr: '',
        first_half_goals_pct: 50, both_teams_score_pct: 55, expected_goals: 2.8,
        cards_avg: 4.5, corners_avg: 9.8,
        key_player: ''
      });
      setEditingId(null);
      await loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: '❌ ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (match: any) => {
    setForm({
      match_date: match.match_date || '',
      match_time: match.match_time || '',
      competition_id: match.competition_id || '',
      home_team_id: match.home_team_id || '',
      away_team_id: match.away_team_id || '',
      predicted_score: match.predicted_score || '',
      analysis_pt: match.analysis_pt || '',
      analysis_en: match.analysis_en || '',
      analysis_es: match.analysis_es || '',
      analysis_fr: match.analysis_fr || '',
      best_bet_pt: match.best_bet_pt || '',
      best_bet_en: match.best_bet_en || '',
      best_bet_es: match.best_bet_es || '',
      best_bet_fr: match.best_bet_fr || '',
      first_half_goals_pct: match.first_half_goals_pct || 50,
      both_teams_score_pct: match.both_teams_score_pct || 55,
      expected_goals: match.expected_goals || 2.8,
      cards_avg: match.cards_avg || 4.5,
      corners_avg: match.corners_avg || 9.8,
      key_player: match.key_player || '',
    });
    setEditingId(match.id);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Excluir esta partida?')) {
      await supabase.from('matches').delete().eq('id', id);
      loadData();
    }
  };

  return (
    <div className="space-y-10">
      <h1 className="text-4xl font-bold text-white">Cadastro de Partidas</h1>

      {message && (
        <div className={`p-5 rounded-2xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-900 text-emerald-300' : 'bg-red-900 text-red-300'}`}>
          {message.type === 'success' ? <CheckCircle /> : <AlertCircle />}
          {message.text}
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8">
        <form onSubmit={handleSubmit} className="space-y-10">

          {/* Básico */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-zinc-400 block mb-2">Data</label>
              <input type="date" value={form.match_date} onChange={e => setForm({...form, match_date: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white" required />
            </div>
            <div>
              <label className="text-zinc-400 block mb-2">Horário (Brasília)</label>
              <input type="time" value={form.match_time} onChange={e => setForm({...form, match_time: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white" required />
            </div>
            <div>
              <label className="text-zinc-400 block mb-2">Competição</label>
              <select value={form.competition_id} onChange={e => setForm({...form, competition_id: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white" required>
                <option value="">Selecione a competição</option>
                {competitions.map(c => <option key={c.id} value={c.id}>{c.name_pt}</option>)}
              </select>
            </div>
          </div>

          {/* Times + Placar Previsto */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="md:col-span-2">
              <label className="text-zinc-400 block mb-2">Time Mandante</label>
              <select value={form.home_team_id} onChange={e => setForm({...form, home_team_id: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white" required>
                <option value="">Selecione Mandante</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name_pt}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-zinc-400 block mb-2">Time Visitante</label>
              <select value={form.away_team_id} onChange={e => setForm({...form, away_team_id: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white" required>
                <option value="">Selecione Visitante</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name_pt}</option>)}
              </select>
            </div>
            <div>
              <label className="text-zinc-400 block mb-2">Previsão de Placar</label>
              <input type="text" placeholder="2x1" value={form.predicted_score} onChange={e => setForm({...form, predicted_score: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white" />
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div>
              <label className="text-zinc-400 block mb-2">% Gols 1º Tempo</label>
              <input type="number" value={form.first_half_goals_pct} onChange={e => setForm({...form, first_half_goals_pct: Number(e.target.value)})} className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white" />
            </div>
            <div>
              <label className="text-zinc-400 block mb-2">Ambos Marcam (%)</label>
              <input type="number" value={form.both_teams_score_pct} onChange={e => setForm({...form, both_teams_score_pct: Number(e.target.value)})} className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white" />
            </div>
            <div>
              <label className="text-zinc-400 block mb-2">Gols Esperados</label>
              <input type="number" step="0.1" value={form.expected_goals} onChange={e => setForm({...form, expected_goals: Number(e.target.value)})} className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white" />
            </div>
            <div>
              <label className="text-zinc-400 block mb-2">Cartões Médios</label>
              <input type="number" step="0.1" value={form.cards_avg} onChange={e => setForm({...form, cards_avg: Number(e.target.value)})} className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white" />
            </div>
            <div>
              <label className="text-zinc-400 block mb-2">Escanteios Médios</label>
              <input type="number" step="0.1" value={form.corners_avg} onChange={e => setForm({...form, corners_avg: Number(e.target.value)})} className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white" />
            </div>
          </div>

          {/* Jogador Destaque */}
          <div>
            <label className="text-zinc-400 block mb-2">Jogador com Possibilidade de Chutar no Gol</label>
            <input 
              type="text" 
              placeholder="Ex: Endrick, Haaland, Mbappé..." 
              value={form.key_player} 
              onChange={e => setForm({...form, key_player: e.target.value})} 
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white" 
            />
          </div>
{/* Análises e Melhor Aposta */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
  <div>
    <label className="text-white font-medium mb-3 block">Análise da Partida</label>
    
    <textarea 
      placeholder="Análise em Português" 
      value={form.analysis_pt} 
      onChange={e => setForm({...form, analysis_pt: e.target.value})} 
      rows={6} 
      className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-5 text-white mb-4" 
    />
    
    <textarea 
      placeholder="Analysis in English" 
      value={form.analysis_en} 
      onChange={e => setForm({...form, analysis_en: e.target.value})} 
      rows={6} 
      className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-5 text-white mb-4" 
    />
    
    <textarea 
      placeholder="Análisis en Español" 
      value={form.analysis_es} 
      onChange={e => setForm({...form, analysis_es: e.target.value})} 
      rows={6} 
      className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-5 text-white mb-4" 
    />
    
    <textarea 
      placeholder="Analyse en Français" 
      value={form.analysis_fr} 
      onChange={e => setForm({...form, analysis_fr: e.target.value})} 
      rows={6} 
      className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-5 text-white" 
    />
  </div>

  <div>
    <label className="text-white font-medium mb-3 block">Melhor Aposta da Partida</label>
    
    <textarea 
      placeholder="Melhor Aposta (PT)" 
      value={form.best_bet_pt} 
      onChange={e => setForm({...form, best_bet_pt: e.target.value})} 
      rows={6} 
      className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-5 text-white mb-4" 
    />
    
    <textarea 
      placeholder="Best Bet (EN)" 
      value={form.best_bet_en} 
      onChange={e => setForm({...form, best_bet_en: e.target.value})} 
      rows={6} 
      className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-5 text-white mb-4" 
    />
    
    <textarea 
      placeholder="Mejor Apuesta (ES)" 
      value={form.best_bet_es} 
      onChange={e => setForm({...form, best_bet_es: e.target.value})} 
      rows={6} 
      className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-5 text-white mb-4" 
    />
    
    <textarea 
      placeholder="Meilleur Pari (FR)" 
      value={form.best_bet_fr} 
      onChange={e => setForm({...form, best_bet_fr: e.target.value})} 
      rows={6} 
      className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-5 text-white" 
    />
  </div>
</div>

          <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 py-5 rounded-2xl font-bold text-xl">
            {loading ? 'Salvando...' : editingId ? 'Atualizar Partida' : 'Cadastrar Partida'}
          </button>
        </form>
      </div>
    </div>
  );
}