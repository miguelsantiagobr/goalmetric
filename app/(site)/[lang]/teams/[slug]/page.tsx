// app/[lang]/teams/[slug]/page.tsx

import { Metadata } from 'next';
import Script from 'next/script';
import { supabase } from '@/lib/supabase';
import TeamDetail from './TeamDetail';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;

  const { data: team } = await supabase
    .from('teams')
    .select('name_pt, name_en, name_es, name_fr, logo_url')
    .eq('slug', slug)
    .single();

  if (!team) {
    return {
      title: 'Time não encontrado | GoalMetric',
    };
  }

  const teamName = team.name_pt;
  return {
    title: `${teamName} - Partidas, Análises e Estatísticas | GoalMetric`,
    description: `Próximos jogos, análises completas e estatísticas do time ${teamName}.`,
  };
}

async function getTeamData(slug: string) {
  const { data, error } = await supabase
    .from('teams')
    .select('*')                    // Busca todos os campos do time
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Erro ao buscar time:', error);
    return null;
  }

  return data;
}

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;

  const team = await getTeamData(slug);

  if (!team) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <div className="text-center px-6">
          <h1 className="text-6xl font-bold mb-6">404</h1>
          <p className="text-3xl mb-4">Time não encontrado</p>
          <p className="text-zinc-400 mb-8">Slug pesquisado: <strong>{slug}</strong></p>
          <a href={`/${lang}/teams`} className="text-emerald-400 hover:underline">
            ← Voltar para lista de times
          </a>
        </div>
      </div>
    );
  }

  // JSON-LD simples
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    "name": team.name_pt,
    "url": `https://goalmetric.online/${lang}/teams/${slug}`,
    "logo": team.logo_url,
  };

  return (
    <>
      <Script
        id="json-ld-team"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TeamDetail lang={lang} slug={slug} />
    </>
  );
}