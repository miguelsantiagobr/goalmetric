'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Pencil, Trash2, CheckCircle, AlertCircle, Upload } from 'lucide-react';

interface Bet {
  id: string;
  name: string;
  logo_url?: string;
}

export default function BetsPage() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [form, setForm] = useState({ name: '', logo_url: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadBets = async () => {
    const { data, error } = await supabase
      .from('bets')
      .select('*')
      .order('name');

    if (error) console.error(error);
    setBets(data || []);
  };

  useEffect(() => {
    loadBets();
  }, []);

  // Upload de Logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setMessage({ type: 'error', text: '❌ Arquivo deve ter no máximo 1MB' });
      return;
    }

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;

    try {
      const { data, error } = await supabase.storage
        .from('bet-logos')
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('bet-logos')
        .getPublicUrl(fileName);

      setForm({ ...form, logo_url: publicUrl });
      setMessage({ type: 'success', text: '✅ Logo carregado com sucesso!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: '❌ Erro ao fazer upload: ' + err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (editingId) {
        const { error } = await supabase
          .from('bets')
          .update({ name: form.name, logo_url: form.logo_url })
          .eq('id', editingId);

        if (error) throw error;
        setMessage({ type: 'success', text: '✅ Bet atualizada com sucesso!' });
      } else {
        const { error } = await supabase
          .from('bets')
          .insert([{ name: form.name, logo_url: form.logo_url }]);

        if (error) throw error;
        setMessage({ type: 'success', text: '✅ Bet cadastrada com sucesso!' });
      }

      setForm({ name: '', logo_url: '' });
      setEditingId(null);
      await loadBets();
    } catch (err: any) {
      setMessage({ type: 'error', text: '❌ ' + (err.message || 'Erro ao salvar') });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bet: Bet) => {
    setForm({ name: bet.name, logo_url: bet.logo_url || '' });
    setEditingId(bet.id);
    setMessage(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta Bet?')) return;

    const { error } = await supabase.from('bets').delete().eq('id', id);
    if (error) {
      setMessage({ type: 'error', text: 'Erro ao excluir' });
    } else {
      setMessage({ type: 'success', text: 'Bet excluída com sucesso!' });
      loadBets();
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-10">Bets / Casas de Apostas</h1>

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
          {editingId ? 'Editar Bet' : 'Nova Bet'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-zinc-400 text-sm block mb-2">Nome da Bet *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="text-zinc-400 text-sm block mb-2">Logo da Bet</label>
            <div className="flex gap-4 items-center">
              <label className="cursor-pointer bg-zinc-800 border border-zinc-700 hover:border-emerald-500 rounded-2xl px-6 py-4 flex items-center gap-3 transition-all">
                <Upload className="w-5 h-5" />
                <span>{uploading ? 'Enviando...' : 'Escolher Logo (PNG/JPG ≤ 1MB)'}</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>

              {form.logo_url && (
                <img src={form.logo_url} alt="preview" className="h-12 object-contain border border-zinc-700 rounded-xl" />
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 transition-all"
          >
            <Plus className="w-6 h-6" />
            {loading ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Cadastrar Bet'}
          </button>
        </form>
      </div>

      {/* Lista */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl overflow-hidden">
        <div className="p-8 border-b border-zinc-700">
          <h3 className="text-xl font-semibold text-white">Bets Cadastradas ({bets.length})</h3>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-700 bg-zinc-950">
              <th className="text-left p-6 text-zinc-400">Nome</th>
              <th className="text-left p-6 text-zinc-400">Logo</th>
              <th className="text-center p-6 text-zinc-400">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {bets.map((bet) => (
              <tr key={bet.id} className="hover:bg-zinc-800/50">
                <td className="p-6 text-white font-medium">{bet.name}</td>
                <td className="p-6">
                  {bet.logo_url ? (
                    <img src={bet.logo_url} alt={bet.name} className="h-10 object-contain" />
                  ) : (
                    <span className="text-zinc-600">Sem logo</span>
                  )}
                </td>
                <td className="p-6 text-center space-x-6">
                  <button onClick={() => handleEdit(bet)} className="text-blue-400 hover:text-blue-300">
                    <Pencil className="w-6 h-6" />
                  </button>
                  <button onClick={() => handleDelete(bet.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-6 h-6" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {bets.length === 0 && (
          <div className="text-center py-16 text-zinc-500">
            Nenhuma Bet cadastrada ainda.
          </div>
        )}
      </div>
    </div>
  );
}