'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Pencil, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

interface Team {
  id: string;
  name_pt: string;
  name_en: string;
  name_es?: string;
  name_fr?: string;
  logo_url?: string;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [form, setForm] = useState({
    name_pt: '',
    name_en: '',
    name_es: '',
    name_fr: '',
    logo_url: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadTeams = async () => {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('name_pt');

    if (error) console.error(error);
    setTeams(data || []);
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (editingId) {
        const { error } = await supabase
          .from('teams')
          .update(form)
          .eq('id', editingId);

        if (error) throw error;
        setMessage({ type: 'success', text: '✅ Time atualizado com sucesso!' });
      } else {
        const { error } = await supabase
          .from('teams')
          .insert(form);

        if (error) throw error;
        setMessage({ type: 'success', text: '✅ Time cadastrado com sucesso!' });
      }

      setForm({ name_pt: '', name_en: '', name_es: '', name_fr: '', logo_url: '' });
      setEditingId(null);
      await loadTeams();
    } catch (err: any) {
      setMessage({ type: 'error', text: '❌ ' + (err.message || 'Erro ao salvar') });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (team: Team) => {
    setForm({
      name_pt: team.name_pt,
      name_en: team.name_en,
      name_es: team.name_es || '',
      name_fr: team.name_fr || '',
      logo_url: team.logo_url || ''
    });
    setEditingId(team.id);
    setMessage(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este time?')) return;

    const { error } = await supabase.from('teams').delete().eq('id', id);
    if (error) {
      setMessage({ type: 'error', text: 'Erro ao excluir' });
    } else {
      setMessage({ type: 'success', text: 'Time excluído com sucesso!' });
      loadTeams();
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-10">Times</h1>

      {/* Mensagem */}
      {message && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-lg ${
          message.type === 'success' 
            ? 'bg-emerald-900/70 border border-emerald-600 text-emerald-300' 
            : 'bg-red-900/70 border border-red-600 text-red-300'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          {message.text}
        </div>
      )}

      {/* Formulário */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 mb-10">
        <h2 className="text-2xl font-semibold text-white mb-8">
          {editingId ? 'Editar Time' : 'Novo Time'}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-zinc-400 text-sm block mb-2">Nome em Português *</label>
            <input
              type="text"
              value={form.name_pt}
              onChange={(e) => setForm({ ...form, name_pt: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="text-zinc-400 text-sm block mb-2">Nome em Inglês *</label>
            <input
              type="text"
              value={form.name_en}
              onChange={(e) => setForm({ ...form, name_en: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="text-zinc-400 text-sm block mb-2">Nome em Espanhol</label>
            <input
              type="text"
              value={form.name_es}
              onChange={(e) => setForm({ ...form, name_es: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white"
            />
          </div>

          <div>
            <label className="text-zinc-400 text-sm block mb-2">Nome em Francês</label>
            <input
              type="text"
              value={form.name_fr}
              onChange={(e) => setForm({ ...form, name_fr: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-zinc-400 text-sm block mb-2">URL do Logo</label>
            <input
              type="text"
              value={form.logo_url}
              onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white"
              placeholder="https://exemplo.com/logo-time.png"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 transition-all"
          >
            <Plus className="w-6 h-6" />
            {loading ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Cadastrar Time'}
          </button>
        </form>
      </div>

      {/* Lista de Times */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl overflow-hidden">
        <div className="p-8 border-b border-zinc-700">
          <h3 className="text-xl font-semibold text-white">Times Cadastrados ({teams.length})</h3>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-700 bg-zinc-950">
              <th className="text-left p-6 text-zinc-400">Nome Português</th>
              <th className="text-left p-6 text-zinc-400">Nome Inglês</th>
              <th className="text-left p-6 text-zinc-400">Logo</th>
              <th className="text-center p-6 text-zinc-400">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {teams.map((team) => (
              <tr key={team.id} className="hover:bg-zinc-800/50">
                <td className="p-6 text-white font-medium">{team.name_pt}</td>
                <td className="p-6 text-zinc-300">{team.name_en}</td>
                <td className="p-6">
                  {team.logo_url ? (
                    <img src={team.logo_url} alt={team.name_pt} className="h-10 object-contain" />
                  ) : (
                    <span className="text-zinc-600">Sem logo</span>
                  )}
                </td>
                <td className="p-6 text-center space-x-6">
                  <button onClick={() => handleEdit(team)} className="text-blue-400 hover:text-blue-300">
                    <Pencil className="w-6 h-6" />
                  </button>
                  <button onClick={() => handleDelete(team.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-6 h-6" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {teams.length === 0 && (
          <div className="text-center py-16 text-zinc-500">
            Nenhum time cadastrado ainda.
          </div>
        )}
      </div>
    </div>
  );
}