'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError('Email ou senha incorretos');
    } else {
      router.push('/admin');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-zinc-900 rounded-3xl border border-zinc-700">
        <div className="text-center mb-10">
          <Lock className="w-16 h-16 mx-auto text-emerald-500 mb-4" />
          <h1 className="text-3xl font-bold">Admin GolMetric</h1>
        </div>

        {error && <p className="text-red-500 text-center mb-6">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-4 bg-zinc-800 rounded-2xl border border-zinc-700"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-4 bg-zinc-800 rounded-2xl border border-zinc-700"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 py-4 rounded-2xl font-semibold hover:bg-emerald-500"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}