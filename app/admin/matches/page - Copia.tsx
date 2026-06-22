'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle, AlertCircle, Upload } from 'lucide-react';

interface Competition { id: string; name_pt: string; name_en?: string; }
interface Team { id: string; name_pt: string; logo_url?: string; }
interface Bet { id: string; name: string; logo_url?: string; }

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);

  const [form, setForm] = useState({
    match_datetime: '',
    competition_id: '',
    home_team_id: '',
    away_team_id: '',
    predicted_score: '',

    analysis_pt: '',
    analysis_en: '',
    analysis_es: '',
    analysis_fr: '',

    best_bet_pt: '',
    best_bet_en: '',
    best_bet_es: '',
    best_bet_fr: '',

    first_half_goals_pct: 50,
    both_teams_score_pct: 55,
    expected_goals: 2.8,
    cards_avg: 4.5,
    corners_avg: 9.8,

    key_player: '',
    key_player_chance: '', // ← Novo campo
  });

  const [matchOdds, setMatchOdds] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    const [compRes, teamRes, betRes, matchRes] = await Promise.all([
      supabase.from('competitions').select('id, name_pt, name_en'),
      supabase.from('teams').select('id, name_pt, logo_url'),
      supabase.from('bets').select('id, name, logo_url'),
      supabase.from('matches').select('*').order('match_date', { ascending: false })
    ]);

    setCompetitions(compRes.data || []);
    setTeams(teamRes.data || []);
    setBets(betRes.data || []);
    setMatches(matchRes.data || []);
  };

  useEffect(() => { loadData(); }, []);

  const generateSlug = (homeName: string, awayName: string, compName: string, date: string) => {
    const clean = (str: string) => 
      str.normalize("NFD")
         .replace(/[\u0300-\u036f]/g, "")
         .replace(/[^a-zA-Z0-9]/g, '')
         .toUpperCase();

    const home = clean(homeName).slice(0, 12);
    const away = clean(awayName).slice(0, 12);
    const comp = clean(compName).slice(0, 12);
    const shortDate = date.replace(/-/g, '');

    return `${home}x${away}${comp}${shortDate}`;
  };

  const updateSitemap = async () => {
    try {
      const secret = process.env.NEXT_PUBLIC_SITEMAP_SECRET;
      if (!secret) {
        console.warn('⚠️ NEXT_PUBLIC_SITEMAP_SECRET não encontrado');
        return;
      }

      const response = await fetch('/api/sitemap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${secret}` },
      });

      if (response.ok) console.log('✅ Sitemap atualizado');
    } catch (err) {
      console.warn('⚠️ Falha ao atualizar sitemap:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const homeTeam = teams.find(t => t.id === form.home_team_id);
      const awayTeam = teams.find(t => t.id === form.away_team_id);
      const competition = competitions.find(c => c.id === form.competition_id);

      const matchDate = form.match_datetime.split('T')[0];
      const matchTime = form.match_datetime.split('T')[1] || '00:00';

      const slug = generateSlug(
        homeTeam?.name_pt || 'TIME1',
        awayTeam?.name_pt || 'TIME2',
        competition?.name_en || competition?.name_pt || 'COMP',
        matchDate
      );

      const payload = {
        match_date: matchDate,
        match_time: matchTime,
        competition_id: form.competition_id,
        home_team_id: form.home_team_id,
        away_team_id: form.away_team_id,
        predicted_score: form.predicted_score,
        slug,

        analysis_pt: form.analysis_pt,
        analysis_en: form.analysis_en,
        analysis_es: form.analysis_es,
        analysis_fr: form.analysis_fr,

        best_bet_pt: form.best_bet_pt,
        best_bet_en: form.best_bet_en,
        best_bet_es: form.best_bet_es,
        best_bet_fr: form.best_bet_fr,

        first_half_goals_pct: form.first_half_goals_pct,
        both_teams_score_pct: form.both_teams_score_pct,
        expected_goals: form.expected_goals,
        cards_avg: form.cards_avg,
        corners_avg: form.corners_avg,
        key_player: form.key_player,
        key_player_chance: form.key_player_chance, // ← Novo campo

        odds: matchOdds.length > 0 ? matchOdds : null,
      };

      if (editingId) {
        const { error } = await supabase.from('matches').update(payload).eq('id', editingId);
        if (error) throw error;
        setMessage({ type: 'success', text: '✅ Partida atualizada com sucesso!' });
      } else {
        const { error } = await supabase.from('matches').insert([payload]);
        if (error) throw error;
        setMessage({ type: 'success', text: '✅ Partida cadastrada com sucesso!' });
      }

      // Reset form
      setForm({
        match_datetime: '',
        competition_id: '',
        home_team_id: '',
        away_team_id: '',
        predicted_score: '',
        analysis_pt: '', analysis_en: '', analysis_es: '', analysis_fr: '',
        best_bet_pt: '', best_bet_en: '', best_bet_es: '', best_bet_fr: '',
        first_half_goals_pct: 50,
        both_teams_score_pct: 55,
        expected_goals: 2.8,
        cards_avg: 4.5,
        corners_avg: 9.8,
        key_player: '',
        key_player_chance: '',
      });
      setMatchOdds([]);
      setEditingId(null);
      await loadData();
      await updateSitemap();

    } catch (err: any) {
      setMessage({ type: 'error', text: '❌ ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (match: any) => {
    setForm({
      match_datetime: match.match_date && match.match_time 
        ? `${match.match_date}T${match.match_time}` : '',
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
      key_player_chance: match.key_player_chance || '', // ← Novo campo
    });

    setMatchOdds(match.odds || []);
    setEditingId(match.id);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Excluir esta partida?')) {
      await supabase.from('matches').delete().eq('id', id);
      loadData();
      updateSitemap();
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

          {/* Data e Hora */}
          <div>
            <label className="text-zinc-400 block mb-2">Data e Horário (Brasília)</label>
            <input 
              type="datetime-local" 
              value={form.match_datetime} 
              onChange={e => setForm({...form, match_datetime: e.target.value})} 
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white" 
              required 
            />
          </div>

          {/* Competição */}
          <div>
            <label className="text-zinc-400 block mb-2">Competição</label>
            <select value={form.competition_id} onChange={e => setForm({...form, competition_id: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white" required>
              <option value="">Selecione a competição</option>
              {competitions.map(c => <option key={c.id} value={c.id}>{c.name_pt}</option>)}
            </select>
          </div>

          {/* Times + Placar */}
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

          {/* ==================== JOGADOR DESTAQUE + CHANCE DE MARCAR ==================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-zinc-400 block mb-2">Jogador com Possibilidade de Chutar no Gol</label>
              <input 
                type="text" 
                placeholder="Ex: Lamine Yamal, Endrick, Mbappé..." 
                value={form.key_player} 
                onChange={e => setForm({...form, key_player: e.target.value})} 
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white" 
              />
            </div>

            <div>
              <label className="text-zinc-400 block mb-2">Chance de Marcar</label>
              <input 
                type="text" 
                placeholder="78% ou 2.45" 
                value={form.key_player_chance} 
                onChange={e => setForm({...form, key_player_chance: e.target.value})} 
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white" 
              />
              <p className="text-xs text-zinc-500 mt-1.5">Exemplo: 78% ou odds 2.45</p>
            </div>
          </div>

          {/* Análises e Melhor Aposta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="text-white font-medium mb-3 block">Análise da Partida</label>
              <textarea placeholder="Análise em Português" value={form.analysis_pt} onChange={e => setForm({...form, analysis_pt: e.target.value})} rows={6} className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-5 text-white mb-4" />
              <textarea placeholder="Analysis in English" value={form.analysis_en} onChange={e => setForm({...form, analysis_en: e.target.value})} rows={6} className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-5 text-white mb-4" />
              <textarea placeholder="Análisis en Español" value={form.analysis_es} onChange={e => setForm({...form, analysis_es: e.target.value})} rows={6} className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-5 text-white mb-4" />
              <textarea placeholder="Analyse en Français" value={form.analysis_fr} onChange={e => setForm({...form, analysis_fr: e.target.value})} rows={6} className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-5 text-white" />
            </div>

            <div>
              <label className="text-white font-medium mb-3 block">Melhor Aposta da Partida</label>
              <textarea placeholder="Melhor Aposta (PT)" value={form.best_bet_pt} onChange={e => setForm({...form, best_bet_pt: e.target.value})} rows={6} className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-5 text-white mb-4" />
              <textarea placeholder="Best Bet (EN)" value={form.best_bet_en} onChange={e => setForm({...form, best_bet_en: e.target.value})} rows={6} className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-5 text-white mb-4" />
              <textarea placeholder="Mejor Apuesta (ES)" value={form.best_bet_es} onChange={e => setForm({...form, best_bet_es: e.target.value})} rows={6} className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-5 text-white mb-4" />
              <textarea placeholder="Meilleur Pari (FR)" value={form.best_bet_fr} onChange={e => setForm({...form, best_bet_fr: e.target.value})} rows={6} className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-5 text-white" />
            </div>
          </div>

          {/* Incluir ODD */}
          <div className="bg-zinc-950 border border-zinc-700 rounded-3xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
              <Upload className="w-6 h-6" /> Incluir ODD
            </h2>

            {bets.length === 0 ? (
              <p className="text-amber-400">Cadastre Bets primeiro para adicionar odds.</p>
            ) : (
              bets.map((bet) => {
                const existing = matchOdds.find(o => o.bet_id === bet.id);
                return (
                  <div key={bet.id} className="mb-10 pb-8 border-b border-zinc-800 last:border-none">
                    <div className="flex items-center gap-4 mb-5">
                      {bet.logo_url && <img src={bet.logo_url} alt={bet.name} className="h-9 w-9 object-contain" />}
                      <h3 className="text-xl font-medium text-white">{bet.name}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      <div className="md:col-span-4">
                        <label className="text-zinc-400 text-sm block mb-3">Disponível em:</label>
                        <div className="flex flex-wrap gap-x-6 gap-y-3">
                          {['pt', 'en', 'es', 'fr'].map(lang => (
                            <label key={lang} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={existing?.languages?.includes(lang) || false}
                                onChange={(e) => {
                                  const current = existing || { bet_id: bet.id, languages: [], odd_value: '', link: '' };
                                  const newLangs = e.target.checked
                                    ? [...(current.languages || []), lang]
                                    : (current.languages || []).filter((l: string) => l !== lang);

                                  setMatchOdds(prev => {
                                    const filtered = prev.filter((o: any) => o.bet_id !== bet.id);
                                    return [...filtered, { ...current, languages: newLangs }];
                                  });
                                }}
                              />
                              <span className="uppercase font-medium">{lang}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="md:col-span-4">
                        <label className="text-zinc-400 text-sm block mb-2">Valor da ODD</label>
                        <input
                          type="text"
                          placeholder="1.85"
                          value={existing?.odd_value || ''}
                          onChange={(e) => {
                            const current = existing || { bet_id: bet.id, languages: [], odd_value: '', link: '' };
                            setMatchOdds(prev => {
                              const filtered = prev.filter((o: any) => o.bet_id !== bet.id);
                              return [...filtered, { ...current, odd_value: e.target.value }];
                            });
                          }}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:border-emerald-500"
                        />
                      </div>

                      <div className="md:col-span-4">
                        <label className="text-zinc-400 text-sm block mb-2">Link da Odd</label>
                        <input
                          type="url"
                          placeholder="https://exemplo.com/aposta"
                          value={existing?.link || ''}
                          onChange={(e) => {
                            const current = existing || { bet_id: bet.id, languages: [], odd_value: '', link: '' };
                            setMatchOdds(prev => {
                              const filtered = prev.filter((o: any) => o.bet_id !== bet.id);
                              return [...filtered, { ...current, link: e.target.value }];
                            });
                          }}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 py-5 rounded-2xl font-bold text-xl transition">
            {loading ? 'Salvando...' : editingId ? 'Atualizar Partida' : 'Cadastrar Partida'}
          </button>
        </form>
      </div>
    </div>
  );
}