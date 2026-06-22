'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Home, Trophy, Shield, X, Menu, LogOut, LogIn, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import GeoBannerSidebar from '@/components/GeoBannerSidebar';
import Image from 'next/image';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLang = pathname.split('/')[1] || 'br';
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const toggleMenu = () => setIsOpen(!isOpen);


// ======================== TRADUÇÕES ========================
  const translations: Record<string, { hello: string; logout: string; login: string; inicio: string; competicoes: string; profile: string; times: string }> = {
    pt: { hello: 'Olá', logout: 'Sair', login: 'Entrar', inicio: 'Início', competicoes: 'Competições', profile: 'Minha Conta', times: 'Times'},
    en: { hello: 'Hello', logout: 'Logout', login: 'Login', inicio: 'Home', competicoes: 'Competitions', profile: 'My Account', times: 'Teams' },
    es: { hello: 'Hola', logout: 'Cerrar sesión', login: 'Iniciar sesión', inicio: 'Inicio', competicoes: 'Competiciones', profile: 'Mi Cuenta', times: 'Equipos' },
    fr: { hello: 'Bonjour', logout: 'Déconnexion', login: 'Se connecter', inicio: 'Accueil', competicoes: 'Compétitions', profile: 'Mon Compte', times: 'Équipes' },
  };

  const selectedLang = currentLang === 'br' ? 'pt' : currentLang;
  const t = translations[selectedLang] || translations.pt;

  // ======================== CARREGAR USUÁRIO ========================
  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, language')
          .eq('id', session.user.id)
          .single();

        setUser({
          ...session.user,
          full_name: profile?.full_name || session.user.email?.split('@')[0] || 'Usuário'
        });
      } else {
        setUser(null);
      }
    };

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, language')
          .eq('id', session.user.id)
          .single();

        setUser({
          ...session.user,
          full_name: profile?.full_name || session.user.email?.split('@')[0] || 'Usuário'
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ======================== MUDAR IDIOMA ========================
  const changeLanguage = async (newLang: string) => {
    if (newLang === currentLang) return;

    const newPath = pathname.replace(`/${currentLang}`, `/${newLang}`);
    router.push(newPath);

    if (user) {
      await supabase
        .from('profiles')
        .update({ language: newLang })
        .eq('id', user.id);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/${currentLang}`);
    setUser(null);
    setIsOpen(false);
  };

  const handleLogin = () => {
    router.push(`/${currentLang}/login`);
    setIsOpen(false);
  };

  return (
    <>
      {/* 1. TOPO MOBILE - Sem linhas residuais na borda de baixo */}
      <header className="lg:hidden fixed top-0 left-0 right-0 w-full h-16 bg-zinc-950 border-b border-zinc-900 z-50 px-6 flex items-center justify-between">
        <Link href={`/${currentLang}`} className="flex items-center">
          <Image 
            src="/" 
            alt="GolMetric Logo" 
            width={140} 
            height={40}
            priority 
            className="object-contain h-9 w-auto"
          />
        </Link>
        
        <button 
          onClick={toggleMenu} 
          className="text-white p-2 hover:bg-zinc-800 rounded-xl transition-colors"
          aria-label="Menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* 2. MENU / SIDEBAR - Corrigido sem bordas feias sobrepostas no Mobile */}
      <div 
        className={`
          /* Configurações Mobile: Limpo, sem linhas cinzas transversais */
          absolute top-16 left-0 w-full bg-zinc-950 z-40 flex flex-col border-b border-zinc-900
          transition-all duration-300 ease-in-out origin-top
          ${isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2 pointer-events-none'}
          
          /* Configurações Desktop: Alinhado a 80px (top-20) e com a altura exata descontada */
          lg:fixed lg:top-20 lg:bottom-0 lg:left-0 lg:w-72 lg:h-[calc(100vh-5rem)] 
          lg:border-r lg:border-b-0 lg:border-zinc-900 lg:bg-zinc-950/20
          lg:translate-x-0 lg:opacity-100 lg:visible lg:pointer-events-auto lg:z-30
        `}
      >
        {/* Container do Conteúdo Superior */}
        <div className="flex-1 flex flex-col">
          
          {/* ==================== USER PROFILE + LANGUAGES (SÓ MOBILE) ==================== */}
          <div className="p-6 border-b border-zinc-900/60 bg-zinc-900/10 lg:hidden">
            {user ? (
              <p className="text-emerald-400 font-semibold mb-4 text-sm truncate">
                {t.hello}, {user.full_name?.split(' ')[0] || 'Usuário'}!
              </p>
            ) : (
              <button
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-2.5 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-2xl text-white font-medium mb-5 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                {t.login}
              </button>
            )}

            {/* Bandeiras de Idioma */}
            <div className="flex flex-wrap gap-2">
              {[
                { code: 'br', flag: 'br' },
                { code: 'en', flag: 'gb' },
                { code: 'es', flag: 'es' },
                { code: 'fr', flag: 'fr' },
              ].map(({ code, flag }) => (
                <button
                  key={code}
                  onClick={() => changeLanguage(code)}
                  className={`p-1 rounded-xl transition-all border ${
                    currentLang === code 
                      ? 'bg-emerald-600 border-emerald-500 scale-105' 
                      : 'bg-zinc-800/50 border-zinc-800/40 hover:bg-zinc-800'
                  }`}
                >
                  <img 
                    src={`/flags/${flag}.png`} 
                    alt={code.toUpperCase()} 
                    className="w-6 h-4 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = `https://flagcdn.com/w40/${flag}.png`;
                    }}
                  />
                </button>
              ))}
            </div>

            {/* Botão "Minha Conta" Mobile (Exibido apenas se logado, abaixo das bandeiras) */}
            {user && (
              <Link
                href={`/${currentLang}/profile`}
                onClick={() => setIsOpen(false)}
                className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold transition-colors"
              >
                <User className="w-3.5 h-3.5 text-zinc-400" />
                {t.profile}
              </Link>
            )}
          </div>

          {/* ==================== LINKS DE NAVEGAÇÃO ==================== */}
          <nav className="p-4 space-y-1.5 py-6">
            <Link 
              href={`/${currentLang}`} 
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl font-medium transition-all ${
                pathname === `/${currentLang}` 
                  ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/10' 
                  : 'hover:bg-zinc-900/50 text-zinc-400'
              }`}
            >
              <Home className="w-5 h-5" />
              {t.inicio}
            </Link>

            <Link 
              href={`/${currentLang}/competitions`} 
              onClick={() => setIsOpen(false)}
             className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl font-medium transition-all ${
                pathname.includes('/competitions')
                  ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/10' 
                  : 'hover:bg-zinc-900/50 text-zinc-400'
              }`}
            >
              <Trophy className="w-5 h-5" />
              {t.competicoes}
            </Link>

 <Link 
              href={`/${currentLang}/teams`} 
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl font-medium transition-all ${
                pathname.includes('/teams')
                  ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/10' 
                  : 'hover:bg-zinc-900/50 text-zinc-400'
              }`}
            >
              <Shield className="w-5 h-5" />
              {t.times}
            </Link>
          </nav>
        </div>

        {/* Rodapé Interno (Banners e Botão Sair) */}
        <div className="p-5 bg-transparent border-t border-zinc-900/60 space-y-4 lg:mt-auto">
          {/* ==================== ADS BANNER ==================== */}
          <div className="w-full max-w-[256px] mx-auto overflow-hidden rounded-xl">
            <GeoBannerSidebar 
              defaultBanner={{
                country: 'DEFAULT',
                imageUrl: 'https://azwbalsmxgoiomapkcyk.supabase.co/storage/v1/object/public/bet-logos/1781588039580.jpg',
                link: 'https://referme.to/michaelsmithmarcelinol-7',
                alt: 'Betano',
              }}
            />
          </div>

          {/* ==================== LOGOUT (SÓ MOBILE) ==================== */}
          {user && (
            <button
              onClick={handleLogout}
              className="w-full lg:hidden flex items-center justify-center gap-3 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              {t.logout}
            </button>
          )}
        </div>
      </div>

      {/* 3. ESCURECIMENTO DE FUNDO (Backdrop Mobile) */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 top-16 bg-black/60 backdrop-blur-xs z-30 transition-opacity"
          onClick={toggleMenu}
        />
      )}
    </>
  );
}