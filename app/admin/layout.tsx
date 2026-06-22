// app/admin/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  Trophy, 
  Calendar, 
  LogOut, 
  Loader2 
} from 'lucide-react';

// Importando o CSS global
import '@/app/globals.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const isLoginPage = pathname === '/admin/login';

  // Verificação de admin
  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    const verifyAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.replace('/admin/login');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile?.role === 'admin') {
          setIsAdmin(true);
        } else {
          router.replace('/');
        }
      } catch (err) {
        console.error('Erro ao verificar admin:', err);
        router.replace('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    verifyAdmin();
  }, [router, isLoginPage]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/admin/login');
  };

  // ====================== HTML + BODY ======================
  return (
    <html lang="pt-BR">
      <head>
        <title>GoalMetric - Administração</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-zinc-950 text-white antialiased">
        {loading && !isLoginPage ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
              <p className="text-zinc-400">Verificando acesso...</p>
            </div>
          </div>
        ) : isLoginPage ? (
          // Página de login - sem sidebar
          <>{children}</>
        ) : !isAdmin ? (
          <div className="min-h-screen bg-zinc-950" />
        ) : (
          // Layout com sidebar (páginas protegidas)
          <div className="min-h-screen flex">
            {/* Sidebar Fixa */}
            <div className="w-72 bg-zinc-900 border-r border-zinc-800 flex flex-col h-screen fixed">
              <div className="p-8 border-b border-zinc-800">
                <h1 className="text-2xl font-bold flex items-center gap-3">
                  ⚽ GoalMetric
                </h1>
                <p className="text-emerald-500 text-sm">Administração</p>
              </div>

              <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                <Link 
                  href="/admin/dashboard" 
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-800 text-white transition-colors"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </Link>

                <Link 
                  href="/admin/competitions" 
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <Trophy className="w-5 h-5" />
                  Competições
                </Link>

                <Link 
                  href="/admin/teams" 
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <Trophy className="w-5 h-5" />
                  Times
                </Link>

                <Link 
                  href="/admin/users" 
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <Users className="w-5 h-5" />
                  Usuários
                </Link>

                <Link 
                  href="/admin/matches" 
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <Calendar className="w-5 h-5" />
                  Partidas
                </Link>

                <Link 
                  href="/admin/ads" 
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <Calendar className="w-5 h-5" />
                  ADS
                </Link>

                <Link 
                  href="/admin/bets" 
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <Calendar className="w-5 h-5" />
                  Bets
                </Link>
              </nav>

              <div className="p-6 border-t border-zinc-800 mt-auto">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 text-red-400 hover:bg-zinc-800 rounded-2xl transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sair
                </button>
              </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="flex-1 ml-72 p-10">
              {children}
            </div>
          </div>
        )}
      </body>
    </html>
  );
}