'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (loginError) {
        setError(loginError.message);
        return;
      }

      if (data?.user) {
        console.log('✅ Login OK → Redirecionando forçadamente...');
        
        // Redirecionamento mais forte
        window.location.href = '/admin/dashboard';
        // router.replace('/admin/dashboard'); // comentado por enquanto
      }
    } catch (err: any) {
      setError('Erro inesperado: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-zinc-900 p-10 rounded-3xl border border-zinc-700">
        <h1 className="text-4xl font-bold text-center mb-8 text-white">
          Admin GoalMetric
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-2xl">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-4 bg-zinc-800 rounded-2xl border border-zinc-700 focus:border-emerald-500 text-white"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-4 bg-zinc-800 rounded-2xl border border-zinc-700 focus:border-emerald-500 text-white"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl font-semibold text-lg transition-colors disabled:opacity-70"
          >
            {loading ? 'Entrando...' : 'Entrar no Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}