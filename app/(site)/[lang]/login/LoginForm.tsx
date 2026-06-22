'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

interface LoginFormProps {
  lang: string;
  currentLang: string;
}

export default function LoginForm({ lang, currentLang }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Traduções
  const t = {
    pt: {
      title: 'Entrar no GolMetric',
      subtitle: 'Acesse análises profissionais de futebol',
      name: 'Nome (opcional)',
      email: 'Email',
      password: 'Senha',
      loginButton: 'Entrar',
      loading: 'Entrando...',
      noAccount: 'Não tem conta?',
      register: 'Criar conta',
    },
    en: {
      title: 'Sign in to GolMetric',
      subtitle: 'Access professional football analysis',
      name: 'Name (optional)',
      email: 'Email',
      password: 'Password',
      loginButton: 'Sign In',
      loading: 'Signing in...',
      noAccount: "Don't have an account?",
      register: 'Create account',
    },
    es: {
      title: 'Iniciar Sesión en GolMetric',
      subtitle: 'Accede a análisis profesionales de fútbol',
      name: 'Nombre (opcional)',
      email: 'Correo electrónico',
      password: 'Contraseña',
      loginButton: 'Iniciar Sesión',
      loading: 'Iniciando sesión...',
      noAccount: '¿No tienes cuenta?',
      register: 'Crear cuenta',
    },
    fr: {
      title: 'Se connecter à GolMetric',
      subtitle: 'Accédez aux analyses professionnelles de football',
      name: 'Nom (optionnel)',
      email: 'Email',
      password: 'Mot de passe',
      loginButton: 'Se connecter',
      loading: 'Connexion en cours...',
      noAccount: "Vous n'avez pas de compte ?",
      register: 'Créer un compte',
    },
  }[currentLang] || t.pt; // fallback pt

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
    } else {
      router.push(`/${lang}`); // Redireciona para home no idioma correto
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-6 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <Lock className="w-16 h-16 text-emerald-500" />
          </div>
          <h1 className="text-4xl font-bold">{t.title}</h1>
          <p className="text-zinc-400 mt-3 text-lg">{t.subtitle}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <div>
            <input
              type="text"
              placeholder={t.name}
              value={name}
              onChange={(e) => setName(e.target.value)}
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

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 py-4 rounded-2xl font-semibold text-lg transition-all duration-200"
          >
            {loading ? t.loading : t.loginButton}
          </button>

          <div className="text-center text-zinc-500 text-sm">
            {t.noAccount}{' '}
            <a href={`/${lang}/register`} className="text-emerald-400 hover:underline">
              {t.register}
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}