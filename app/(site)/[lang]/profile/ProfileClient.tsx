'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, Lock, LogOut, Save, Loader2, CheckCircle2 } from 'lucide-react';

export default function ProfileClient({ lang }: { lang: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Estados dos campos do formulário
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [userLang, setUserLang] = useState(lang);

  // ======================== DICIONÁRIO DE TRADUÇÕES ========================
  const translations: Record<string, any> = {
    br: {
      title: 'Minha Conta',
      subtitle: 'Gerencie suas informações pessoais e preferências do sistema.',
      labelName: 'Nome Completo',
      labelEmail: 'E-mail (Não alterável)',
      labelLang: 'Idioma de Preferência',
      btnSave: 'Salvar Alterações',
      btnLogout: 'Sair da Conta',
      success: 'Perfil atualizado com sucesso!',
      loading: 'Carregando dados...',
    },
    en: {
      title: 'My Account',
      subtitle: 'Manage your personal information and system preferences.',
      labelName: 'Full Name',
      labelEmail: 'Email (Read-only)',
      labelLang: 'Preferred Language',
      btnSave: 'Save Changes',
      btnLogout: 'Logout',
      success: 'Profile updated successfully!',
      loading: 'Loading data...',
    },
    es: {
      title: 'Mi Cuenta',
      subtitle: 'Gestione su información personal y preferencias del sistema.',
      labelName: 'Nombre Completo',
      labelEmail: 'Correo electrónico (No modificável)',
      labelLang: 'Idioma de Preferencia',
      btnSave: 'Guardar Cambios',
      btnLogout: 'Cerrar Sesión',
      success: '¡Perfil actualizado con éxito!',
      loading: 'Cargando datos...',
    },
    fr: {
      title: 'Mon Compte',
      subtitle: 'Gérez vos informations personnelles et les préférences du système.',
      labelName: 'Nom Complet',
      labelEmail: 'E-mail (Non modifiable)',
      labelLang: 'Langue Préférée',
      btnSave: 'Enregistrer',
      btnLogout: 'Se Déconnecter',
      success: 'Profil mis à jour avec succès!',
      loading: 'Chargement des données...',
    },
  };

  const t = translations[lang] || translations.br;

  // ======================== CARREGAR DADOS DO SUPABASE ========================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Se não houver sessão ativa, redireciona para o login
          router.push(`/${lang}/login`);
          return;
        }

        setEmail(session.user.email || '');

        // Busca o perfil estendido na tabela customizada 'profiles'
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('full_name, language')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setFullName(profile.full_name || '');
          setUserLang(profile.language || lang);
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [lang, router]);

  // ======================== ATUALIZAR PERFIL ========================
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setSuccessMessage('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          language: userLang,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (error) throw error;

      setSuccessMessage(t.success);

      // Se o usuário mudou o idioma do perfil, redireciona a URL para o novo idioma
      if (userLang !== lang) {
        setTimeout(() => {
          router.push(`/${userLang}/profile`);
        }, 1000);
      }
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
    } finally {
      setUpdating(false);
    }
  };

  // ======================== LOGOUT ========================
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/${lang}`);
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <p className="text-sm font-medium">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Cabeçalho da página */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">{t.title}</h1>
        <p className="text-sm text-zinc-400 mt-1">{t.subtitle}</p>
      </div>

      {/* Alerta de Sucesso */}
      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-3 text-sm font-medium animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Caixa do Formulário Principal (Alinhado com a paleta escura do app) */}
      <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-6 lg:p-8 backdrop-blur-xs space-y-6">
        <form onSubmit={handleUpdateProfile} className="space-y-5">
          
          {/* Campo: E-mail (Bloqueado) */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" />
              {t.labelEmail}
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full bg-zinc-950/50 border border-zinc-900/60 rounded-xl py-3 px-4 text-sm text-zinc-500 cursor-not-allowed outline-none select-none"
            />
          </div>

          {/* Campo: Nome Completo */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-zinc-500" />
              {t.labelName}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl py-3 px-4 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-700 focus:bg-zinc-950/80 transition-all"
            />
          </div>

          {/* Campo: Idioma de Preferência */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              {t.labelLang}
            </label>
            <select
              value={userLang}
              onChange={(e) => setUserLang(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl py-3 px-4 text-sm text-zinc-300 focus:outline-none focus:border-zinc-700 focus:bg-zinc-950/80 transition-all cursor-pointer appearance-none"
            >
              <option value="br">Português (BR)</option>
              <option value="en">English (US)</option>
              <option value="es">Español (ES)</option>
              <option value="fr">Français (FR)</option>
            </select>
          </div>

          {/* Botão de Envio */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={updating}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:bg-zinc-800 disabled:text-zinc-500 font-bold text-sm text-white rounded-xl tracking-wide transition-colors shadow-lg shadow-emerald-950/10 cursor-pointer disabled:cursor-not-allowed"
            >
              {updating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {t.btnSave}
            </button>
          </div>

        </form>

        {/* Divisor Visor Interno */}
        <div className="border-t border-zinc-900/60 my-2" />

        {/* Zona de Perigo / Logout */}
        <div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-red-950/10 hover:bg-red-500/10 border border-red-950/30 hover:border-red-500/20 text-red-400 font-semibold text-sm rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            {t.btnLogout}
          </button>
        </div>

      </div>
    </div>
  );
}