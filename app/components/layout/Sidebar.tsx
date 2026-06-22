'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, Users, Calendar, LogOut } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-72 bg-zinc-900 border-r border-zinc-800 h-screen fixed hidden lg:flex flex-col">
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="text-4xl">⚽</div>
          <h1 className="text-3xl font-bold">GolMetric</h1>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <Link href="/" className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${pathname === '/' ? 'bg-emerald-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}>
          <Home className="w-5 h-5" />
          Início
        </Link>

        <Link href="/competitions" className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${pathname.includes('/competitions') ? 'bg-emerald-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}>
          <Trophy className="w-5 h-5" />
          Competições
        </Link>

        <Link href="/teams" className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${pathname.includes('/teams') ? 'bg-emerald-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}>
          <Users className="w-5 h-5" />
          Times
        </Link>

        <Link href="/matches" className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${pathname.includes('/matches') ? 'bg-emerald-600 text-white' : 'hover:bg-zinc-800 text-zinc-300'}`}>
          <Calendar className="w-5 h-5" />
          Partidas
        </Link>
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button className="flex items-center gap-4 px-5 py-4 w-full text-red-400 hover:bg-red-950/50 rounded-2xl transition-all">
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </div>
    </div>
  );
}