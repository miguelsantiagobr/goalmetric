'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';

type Banner = {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
  position: 'top' | 'sidebar';
  language: string;
  active: boolean;
  created_at: string;
};

export default function AdminAds() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    link_url: '',
    position: 'top' as 'top' | 'sidebar',
    language: 'pt',
    active: true,
  });

  const fetchBanners = async () => {
    const { data } = await supabase
      .from('banners')
      .select('*')
      .order('language')
      .order('position')
      .order('created_at', { ascending: false });

    setBanners(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingBanner) {
      await supabase.from('banners').update(formData).eq('id', editingBanner.id);
    } else {
      await supabase.from('banners').insert([formData]);
    }

    setFormData({ title: '', image_url: '', link_url: '', position: 'top', language: 'pt', active: true });
    setEditingBanner(null);
    fetchBanners();
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData(banner);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Excluir este banner?')) {
      await supabase.from('banners').delete().eq('id', id);
      fetchBanners();
    }
  };

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold">Gerenciar Banners por Idioma</h1>

      {/* Formulário */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8">
        <h2 className="text-xl font-semibold mb-6">
          {editingBanner ? 'Editar Banner' : 'Novo Banner'}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Idioma</label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4"
            >
              <option value="pt">🇧🇷 Português</option>
              <option value="en">🇬🇧 English</option>
              <option value="es">🇪🇸 Español</option>
              <option value="fr">🇫🇷 Français</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Posição</label>
            <select
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value as 'top' | 'sidebar' })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4"
            >
              <option value="top">🔝 Topo da Página</option>
              <option value="sidebar">📍 Sidebar</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-zinc-400 mb-2">Título</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4" required />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-zinc-400 mb-2">URL da Imagem</label>
            <input type="text" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4" required />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-zinc-400 mb-2">Link de Destino</label>
            <input type="text" value={formData.link_url} onChange={(e) => setFormData({ ...formData, link_url: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4" required />
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} />
            <label>Ativo</label>
          </div>

          <div className="md:col-span-2 flex gap-4">
            <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl font-semibold">
              {editingBanner ? 'Salvar Alterações' : 'Cadastrar Banner'}
            </button>
            {editingBanner && (
              <button type="button" onClick={() => { setEditingBanner(null); setFormData({ title: '', image_url: '', link_url: '', position: 'top', language: 'pt', active: true }); }} className="px-8 py-4 border border-zinc-700 rounded-2xl">
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Lista */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8">
        <h2 className="text-xl font-semibold mb-6">Banners Cadastrados</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {banners.map(b => (
            <div key={b.id} className="border border-zinc-700 rounded-3xl overflow-hidden">
              <img src={b.image_url} alt={b.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-emerald-400 text-sm">{b.language.toUpperCase()} • {b.position === 'top' ? 'Topo' : 'Sidebar'}</p>
                    <h3 className="font-semibold mt-1">{b.title}</h3>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full ${b.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700'}`}>
                    {b.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => handleEdit(b)} className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-2xl">Editar</button>
                  <button onClick={() => handleDelete(b.id)} className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl">Excluir</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}