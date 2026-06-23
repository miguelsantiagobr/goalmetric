'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LogIn, LogOut, ChevronDown, Globe, Smartphone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLang = pathname.split('/')[1] || 'br';
  const [user, setUser] = useState<any>(null);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  // ======================== TRADUÇÕES ========================
  const translations: Record<string, { login: string; logout: string; perfil: string }> = {
    pt: { login: 'Entrar', logout: 'Sair', perfil: 'Minha Conta' },
    en: { login: 'Login', logout: 'Logout', perfil: 'My Account' },
    es: { login: 'Iniciar sesión', logout: 'Cerrar sesión', perfil: 'Mi Cuenta' },
    fr: { login: 'Se connecter', logout: 'Déconnexion', perfil: 'Mon Compte' },
  };

  const selectedLang = currentLang === 'br' ? 'pt' : currentLang;
  const t = translations[selectedLang] || translations.pt;

  // ======================== MONITORAR AUTENTICAÇÃO ========================
  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single();
        setUser({ ...session.user, name: profile?.full_name || 'Usuário' });
      }
    };
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const changeLanguage = (newLang: string) => {
    if (newLang === currentLang) return;
    const newPath = pathname.replace(`/${currentLang}`, `/${newLang}`);
    router.push(newPath);
    setShowLangDropdown(false);
  };

  return (
    /* A borda inferior agora só é gerada no desktop (lg:border-b) eliminando a linha feia no mobile */
    <header className="fixed top-0 left-0 right-0 w-full h-20 bg-zinc-950 backdrop-blur-md z-50 px-6 lg:px-12 flex items-center justify-between lg:border-b lg:border-zinc-900">
      
{/* LADO ESQUERDO: Logotipo Oficial */}
<div className="flex items-center">
  <Link href={`/${currentLang}`} className="transition-opacity hover:opacity-90">
    <Image 
      src="/logo.png" 
      alt="GolMetric Logo" 
      width={164} 
      height={70} 
      priority
      // Adicionado "hidden md:block" para esconder no mobile e mostrar no desktop
      className="object-contain h-15 w-auto hidden md:block"
    />
  </Link>
</div>

      {/* CENTRO: Botão de Instalação (Exclusivo PC conforme imagem) */}

      {/* LADO DIREITO: Idiomas, Fuso Horário e Painel de Usuário */}
      <div className="flex items-center gap-6">
        
        {/* Seletor de Idiomas Inline Simplificado */}
        <div className="hidden sm:flex items-center gap-3 text-xs font-semibold text-zinc-500">
          {/* Brasil */}
          <a 
            onClick={() => changeLanguage('br')} 
            className={`transition-all p-0.5 rounded-sm ${currentLang === 'br' ? 'ring-2 ring-emerald-500/50 scale-105' : 'opacity-60 hover:opacity-100'}`}
          > 
            <img 
              src="/flags/br.png" 
              alt="Brasil"
              className="w-6 h-4 object-cover rounded-xs shadow-xs" 
            />
          </a>
          
          <span className="text-zinc-800">|</span>
          
          {/* United Kingdom */}
          <a 
            onClick={() => changeLanguage('en')} 
            className={`transition-all p-0.5 rounded-sm ${currentLang === 'en' ? 'ring-2 ring-emerald-500/50 scale-105' : 'opacity-60 hover:opacity-100'}`}
          >
            <img 
              src="/flags/gb.png" 
              alt="English"
              className="w-6 h-4 object-cover rounded-xs shadow-xs" 
            />
          </a>
          
          <span className="text-zinc-800">|</span>
          
          {/* Espanha */}
          <a 
            onClick={() => changeLanguage('es')} 
            className={`transition-all p-0.5 rounded-sm ${currentLang === 'es' ? 'ring-2 ring-emerald-500/50 scale-105' : 'opacity-60 hover:opacity-100'}`}
          >
            <img 
              src="/flags/es.png" 
              alt="Español"
              className="w-6 h-4 object-cover rounded-xs shadow-xs" 
            />
          </a>
          
          <span className="text-zinc-800">|</span>
          
          {/* França */}
          <a 
            onClick={() => changeLanguage('fr')} 
            className={`transition-all p-0.5 rounded-sm ${currentLang === 'fr' ? 'ring-2 ring-emerald-500/50 scale-105' : 'opacity-60 hover:opacity-100'}`}
          >
            <img 
              src="/flags/fr.png" 
              alt="Français"
              className="w-6 h-4 object-cover rounded-xs shadow-xs" 
            />
          </a>
        </div>


        {/* Botão Dinâmico de Login / Perfil */}
        <div>
          {user ? (
            <div className="flex items-center gap-2">
              <Link 
                href={`/${currentLang}/profile`}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {t.perfil}
              </Link>
            </div>
          ) : (
            <Link 
              href={`/${currentLang}/login`}
              className="bg-indigo-950/30 hover:bg-indigo-600 border border-indigo-500/30 hover:border-indigo-500 text-indigo-400 hover:text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-inner"
            >
              <LogIn className="w-3.5 h-3.5" />
              {t.login}
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}