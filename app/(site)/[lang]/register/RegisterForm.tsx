'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';

interface RegisterFormProps {
  lang: string;
  currentLang: string;
}

export default function RegisterForm({ lang, currentLang }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const t = {
    pt: {
      title: 'Criar sua conta',
      subtitle: 'Junte-se ao GolMetric e tenha acesso a previsões premium',
      name: 'Nome completo',
      email: 'Email',
      password: 'Senha',
      confirmPassword: 'Confirmar senha',
      registerButton: 'Criar conta',
      loading: 'Criando conta...',
      haveAccount: 'Já tem uma conta?',
      login: 'Entrar',
      success: 'Conta criada com sucesso! Verifique seu email para confirmar.',
    },
    en: {
      title: 'Create your account',
      subtitle: 'Join GolMetric and get access to premium predictions',
      name: 'Full name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
      registerButton: 'Create account',
      loading: 'Creating account...',
      haveAccount: 'Already have an account?',
      login: 'Sign in',
      success: 'Account created successfully! Please check your email to confirm.',
    },
    es: {
      title: 'Crea tu cuenta',
      subtitle: 'Únete a GolMetric y obtén acceso a predicciones premium',
      name: 'Nombre completo',
      email: 'Correo electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmar contraseña',
      registerButton: 'Crear cuenta',
      loading: 'Creando cuenta...',
      haveAccount: '¿Ya tienes cuenta?',
      login: 'Iniciar sesión',
      success: '¡Cuenta creada con éxito! Revisa tu correo para confirmar.',
    },
    fr: {
      title: 'Créer votre compte',
      subtitle: 'Rejoignez GolMetric et accédez à des prédictions premium',
      name: 'Nom complet',
      email: 'Email',
      password: 'Mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      registerButton: 'Créer un compte',
      loading: 'Création du compte...',
      haveAccount: 'Vous avez déjà un compte ?',
      login: 'Se connecter',
      success: 'Compte créé avec succès ! Veuillez vérifier votre email pour confirmer.',
    },
  }[currentLang] || t.pt;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError(currentLang === 'pt' ? 'As senhas não coincidem' : 
               currentLang === 'en' ? 'Passwords do not match' : 
               currentLang === 'es' ? 'Las contraseñas no coinciden' : 
               'Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(currentLang === 'pt' ? 'A senha deve ter pelo menos 6 caracteres' : 'Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name.trim(),
          language: currentLang,        // ← Idioma salvo aqui (para mailing)
          preferred_language: currentLang,
          registration_lang: lang,      // 'pt', 'en', 'es', 'fr'
        },
      },
    });

    if (authError) {
      setError(authError.message);
    } else {
      setSuccess(t.success);

      // Opcional: Criar perfil na tabela 'profiles' (recomendado)
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: name.trim(),
          language: currentLang,
          updated_at: new Date().toISOString(),
        });
      }

      // Redireciona para login após 2.5s
      setTimeout(() => {
        router.push(`/${lang}/login`);
      }, 2500);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-6 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <UserPlus className="w-16 h-16 text-emerald-500" />
          </div>
          <h1 className="text-4xl font-bold">{t.title}</h1>
          <p className="text-zinc-400 mt-3 text-lg">{t.subtitle}</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6 bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <div>
            <input
              type="text"
              placeholder={t.name}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-5 py-4 focus:border-emerald-500 outline-none transition"
            />
          </div>

          <div>
            <input
              type="email"
              placeholder={t.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-5 py-4 focus:border-emerald-500 outline-none transition"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder={t.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-5 py-4 focus:border-emerald-500 outline-none transition"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder={t.confirmPassword}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-5 py-4 focus:border-emerald-500 outline-none transition"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && <p className="text-emerald-500 text-sm text-center">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 py-4 rounded-2xl font-semibold text-lg transition-all duration-200"
          >
            {loading ? t.loading : t.registerButton}
          </button>

          <div className="text-center text-zinc-500 text-sm">
            {t.haveAccount}{' '}
            <a href={`/${lang}/login`} className="text-emerald-400 hover:underline font-medium">
              {t.login}
            </a>
          </div>
        </form>

        {/* Debug info (remover depois) */}
        {/* <p className="text-center text-xs text-zinc-600 mt-4">Idioma registrado: {currentLang}</p> */}
      </div>
    </div>
  );
}