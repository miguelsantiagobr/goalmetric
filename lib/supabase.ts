// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltam as variáveis do Supabase no .env.local');
}

// Cliente para uso no Client Components
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente para Server Components / API Routes
export const createServerClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey);
};