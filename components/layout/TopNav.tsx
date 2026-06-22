'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { User, Menu } from 'lucide-react';

export default function TopNav() {
  const { lang } = useParams();
  const currentLang = lang || 'br';

  return (
    <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-40 lg:hidden">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-3xl">⚽</div>
          <h1 className="text-2xl font-bold">GolMetric</h1>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href={`/${currentLang}/login`} 
            className="flex items-center gap-2 bg-white text-black px-5 py-2 rounded-full font-semibold hover:bg-emerald-400 transition-colors"
          >
            <User className="w-5 h-5" />
            Entrar
          </Link>

          <button className="lg:hidden p-2 text-zinc-400 hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}