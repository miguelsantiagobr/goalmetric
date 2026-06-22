'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Pencil, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

interface Competition {
  id: string;
  name_pt: string;
  name_en: string;
  logo_url?: string;
}

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [form, setForm] = useState({ name_pt: '', name_en: '', logo_url: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadCompetitions = async () => {
    console.log("🔄 Carregando competições...");
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .order('name_pt', { ascending: true });

    if (error) {
      console.error("❌ Erro ao carregar:", error);
      setMessage({ type: 'error', text: 'Erro ao carregar lista: ' + error.message });
    } else {
      console.log("✅ Competições carregadas:", data?.length || 0);
      setCompetitions(data || []);
    }
  };

  useEffect(() => {
    loadCompetitions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    console.log("📤 Tentando salvar:", form);

    try {
      if (editingId) {
        const { error } = await supabase
          .from('competitions')
          .update(form)
          .eq('id', editingId);

        if (error) throw error;
        setMessage({ type: 'success', text: '✅ Competição atualizada com sucesso!' });
      } else {
        const { data, error } = await supabase
          .from('competitions')
          .insert(form)
          .select();

        if (error) throw error;
        console.log("✅ Inserido com sucesso:", data);
        setMessage({ type: 'success', text: '✅ Competição cadastrada com sucesso!' });
      }

      setForm({ name_pt: '', name_en: '', logo_url: '' });
      setEditingId(null);
      await loadCompetitions();        // Força recarregar

    } catch (error: any) {
      console.error("❌ Erro completo:", error);
      setMessage({ 
        type: 'error', 
        text: '❌ ' + (error.message || 'Erro desconhecido ao salvar') 
      });
    } finally {
      setLoading(false);
    }
  };

  // ... (handleEdit e handleDelete iguais)

  const handleEdit = (comp: Competition) => {
    setForm({
      name_pt: comp.name_pt,
      name_en: comp.name_en,
      logo_url: comp.logo_url || ''
    });
    setEditingId(comp.id);
    setMessage(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta competição?')) return;

    const { error } = await supabase.from('competitions').delete().eq('id', id);
    if (error) {
      setMessage({ type: 'error', text: 'Erro ao excluir' });
    } else {
      setMessage({ type: 'success', text: 'Competição excluída!' });
      loadCompetitions();
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-8">Competições</h1>

      {message && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-lg ${
          message.type === 'success' 
            ? 'bg-emerald-900/70 border border-emerald-600 text-emerald-300' 
            : 'bg-red-900/70 border border-red-600 text-red-300'
        }`}>
          {message.type === 'success' ? <CheckCircle /> : <AlertCircle />}
          {message.text}
        </div>
      )}

      {/* Formulário */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 mb-10">
        <h2 className="text-2xl font-semibold text-white mb-6">
          {editingId ? 'Editar Competição' : 'Nova Competição'}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-zinc-400 text-sm mb-2 block">Nome em Português *</label>
            <input
              type="text"
              value={form.name_pt}
              onChange={(e) => setForm({ ...form, name_pt: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white"
              required
            />
          </div>

          <div>
            <label className="text-zinc-400 text-sm mb-2 block">Nome em Inglês *</label>
            <input
              type="text"
              value={form.name_en}
              onChange={(e) => setForm({ ...form, name_en: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white"
              required
            />
          </div>

          <div>
            <label className="text-zinc-400 text-sm mb-2 block">URL do Logo</label>
            <input
              type="text"
              value={form.logo_url}
              onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="md:col-span-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-70 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3"
          >
            <Plus className="w-6 h-6" />
            {loading ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Cadastrar Competição'}
          </button>
        </form>
      </div>

      {/* Lista */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8">
        <h3 className="text-xl font-semibold text-white mb-6">
          Competições Cadastradas ({competitions.length})
        </h3>

        {competitions.length === 0 ? (
          <p className="text-zinc-500 py-10 text-center">Nenhuma competição cadastrada ainda.</p>
        ) : (
          <div className="space-y-4">
            {competitions.map(comp => (
              <div key={comp.id} className="flex items-center justify-between bg-zinc-800 rounded-2xl p-5">
                <div>
                  <p className="text-white font-medium">{comp.name_pt}</p>
                  <p className="text-zinc-500 text-sm">{comp.name_en}</p>
                </div>
                {comp.logo_url && <img src={comp.logo_url} className="h-10" />}
                <div className="flex gap-4">
                  <button onClick={() => handleEdit(comp)} className="text-blue-400">
                    <Pencil />
                  </button>
                  <button onClick={() => handleDelete(comp.id)} className="text-red-400">
                    <Trash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}