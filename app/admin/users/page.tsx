'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Search } from 'lucide-react';

type Profile = {
  id: string;
  full_name: string | null;
  language: string | null;
  role: string | null;
  created_at: string;
  email: string | null;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const itemsPerPage = 20;

  const fetchUsers = async () => {
    setLoading(true);

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    // Filtro por idioma
    if (languageFilter) {
      query = query.eq('language', languageFilter);
    }

    // Busca por nome
    if (search.trim()) {
      query = query.ilike('full_name', `%${search.trim()}%`);
    }

    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Erro ao buscar usuários:', error);
    } else {
      setUsers(data || []);
      setTotalUsers(count || 0);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, languageFilter, search]);

  const totalPages = Math.ceil(totalUsers / itemsPerPage);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="w-8 h-8" />
            Usuários
          </h1>
          <p className="text-zinc-400 mt-1">Total cadastrados: <span className="text-white font-semibold">{totalUsers}</span></p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 pl-12 py-4 rounded-2xl text-white placeholder-zinc-500 focus:border-emerald-500 outline-none"
          />
        </div>

        <div className="w-full md:w-72">
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 px-5 py-4 rounded-2xl text-white focus:border-emerald-500 outline-none"
          >
            <option value="">Todos os idiomas</option>
            <option value="pt">🇧🇷 Português</option>
            <option value="en">🇬🇧 English</option>
            <option value="es">🇪🇸 Español</option>
            <option value="fr">🇫🇷 Français</option>
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-700">
              <th className="text-left p-6 text-zinc-400 font-normal">Nome Completo</th>
              <th className="text-left p-6 text-zinc-400 font-normal">Email</th>
              <th className="text-left p-6 text-zinc-400 font-normal">Idioma</th>
              <th className="text-left p-6 text-zinc-400 font-normal">Cargo</th>
              <th className="text-left p-6 text-zinc-400 font-normal">Cadastrado em</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-20 text-center text-zinc-400">Carregando usuários...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-20 text-center text-zinc-400">
                  Nenhum usuário encontrado com os filtros atuais.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                  <td className="p-6 font-medium">{user.full_name || '—'}</td>
                  <td className="p-6 text-zinc-400">
                    {/* Vamos tentar pegar o email do auth se possível */}
                    {user.email || '—'}
                  </td>
                  <td className="p-6">
                    <span className="px-4 py-1.5 bg-zinc-800 rounded-full text-sm uppercase">
                      {user.language || '—'}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                      user.role === 'admin' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-zinc-700 text-zinc-300'
                    }`}>
                      {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                    </span>
                  </td>
                  <td className="p-6 text-zinc-400 text-sm">
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-between items-center">
          <p className="text-zinc-400 text-sm">
            Mostrando {(currentPage - 1) * 20 + 1}–{Math.min(currentPage * 20, totalUsers)} de {totalUsers}
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 rounded-2xl disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="px-6 py-3 bg-zinc-800 rounded-2xl">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 rounded-2xl disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}