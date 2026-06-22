// app/(site)/[lang]/match/[slug]/page.tsx

import { Metadata } from 'next';
import Script from 'next/script';
import { supabase } from '@/lib/supabase';
import MatchDetailClient from './MatchDetailClient';

const translations = {
  pt: {
    titleSuffix: 'Análise Completa',
    confira: 'Confira a previsão',
    estatiscaseo: 'Estatísticas, Melhor Aposta, Gols Esperados e Análise Completa',
  },
  en: {
    titleSuffix: 'Full Analysis',
    confira: 'Match prediction for',
    estatiscaseo: 'Statistics, Best Bet, Expected Goals and Full Analysis',
  },
  es: {
    titleSuffix: 'Análisis Completo',
    confira: 'Pronóstico del partido de',
    estatiscaseo: 'Estadísticas, Mejor Apuesta, Goles Esperados y Análisis Completo',
  },
  fr: {
    titleSuffix: 'Analyse Complète',
    confira: 'Pronostic du match de',
    estatiscaseo: 'Statistiques, Meilleur Pari, Buts Attendus et Analyse Complète',
  },
} as const;

function getOgImage(lang: string): string {
  if (lang === 'en') return 'https://goalmetric.online/goalmetricen.jpg';
  if (lang === 'es') return 'https://goalmetric.online/golmetrices.jpg';
  if (lang === 'fr') return 'https://goalmetric.online/goalmetricfr.jpg';
  return 'https://goalmetric.online/goalmetric.jpg';
}

// Formata data com segurança
const formatTitleDate = (dateString: string | undefined, currentLang: string) => {
  if (!dateString) return 'Data não definida';

  try {
    const date = new Date(`${dateString}T12:00:00`);
    const localeMap: Record<string, string> = {
      pt: 'pt-BR',
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
    };
    return date.toLocaleDateString(localeMap[currentLang] || 'pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return 'Data não definida';
  }
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;

  const currentLang = lang === 'br' ? 'pt' : (lang as keyof typeof translations) || 'pt';
  const t = translations[currentLang] || translations.pt;

  const { data: match } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!home_team_id(name_pt, name_en, name_es, name_fr),
      away_team:teams!away_team_id(name_pt, name_en, name_es, name_fr),
      competition:competitions(name_pt, name_en, name_es, name_fr)
    `)
    .eq('slug', slug)
    .single();

  if (!match) {
    return {
      title: 'Partida não encontrada | GoalMetric',
      description: 'A partida solicitada não foi encontrada.',
      robots: { index: false, follow: false },
    };
  }

  const homeName = match?.home_team?.[`name_${currentLang}`] || match?.home_team?.name_pt || 'Time Casa';
  const awayName = match?.away_team?.[`name_${currentLang}`] || match?.away_team?.name_pt || 'Time Fora';
  const competitionName = match?.competition?.[`name_${currentLang}`] || match?.competition?.name_pt || '';

  const matchDate = formatTitleDate(match.match_date, currentLang);

  const analysisText = match[`analysis_${currentLang}`] || match.analysis_pt || '';
  const first20Words = analysisText.split(/\s+/).slice(0, 20).join(' ') + 
                      (analysisText.split(/\s+/).length > 20 ? '...' : '');

  const title = `${homeName} x ${awayName} (${matchDate}) - ${t.estatiscaseo}`;
  const description = `${t.confira} ${homeName} x ${awayName} - ${t.estatiscaseo} - ${competitionName}`;

  const ogImage = getOgImage(currentLang);
  const baseUrl = `https://goalmetric.online/${lang}/match/${slug}`;

  return {
    title,
    description,
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    openGraph: {
      title,
      description,
      images: [{ url: ogImage }],
      url: baseUrl,
      type: 'website',
      locale: currentLang === 'pt' ? 'pt_BR' : currentLang,
      siteName: 'GoalMetric',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: baseUrl,
      languages: {
        pt: `https://goalmetric.online/br/match/${slug}`,
        en: `https://goalmetric.online/en/match/${slug}`,
        es: `https://goalmetric.online/es/match/${slug}`,
        fr: `https://goalmetric.online/fr/match/${slug}`,
        'x-default': `https://goalmetric.online/br/match/${slug}`,
      },
    },
  };
}

async function getMatchData(slug: string) {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!home_team_id (*),
      away_team:teams!away_team_id (*),
      competition:competitions (*)
    `)
    .eq('slug', slug)
    .single();

  if (error) console.error('Erro Supabase:', error);
  return data;
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const currentLang = lang === 'br' ? 'pt' : lang || 'pt';

  const match = await getMatchData(slug);

  if (!match) {
    return <div className="text-center py-32 text-4xl text-white">404 - Partida não encontrada</div>;
  }

  const homeName = match.home_team?.[`name_${currentLang}`] || match.home_team?.name_pt || 'Time Casa';
  const awayName = match.away_team?.[`name_${currentLang}`] || match.away_team?.name_pt || 'Time Fora';
  const competitionName = match.competition?.[`name_${currentLang}`] || match.competition?.name_pt || '';

  const matchDateFormatted = formatTitleDate(match.match_date, currentLang);

  // ==================== JSON-LD SCHEMA.ORG ====================
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SportsEvent",
        "name": `${homeName} vs ${awayName}`,
        "sport": "Soccer",
        "startDate": match.match_date && match.match_time
          ? `${match.match_date}T${match.match_time.substring(0, 5)}:00-03:00`
          : undefined,
        "url": `https://goalmetric.online/${lang}/match/${slug}`,
        "description": `${competitionName} - ${homeName} x ${awayName}`,
        "competitor": [
          { "@type": "SportsTeam", "name": homeName },
          { "@type": "SportsTeam", "name": awayName }
        ],
        "organizer": {
          "@type": "Organization",
          "name": "GoalMetric",
          "url": "https://goalmetric.online"
        },
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
        "isAccessibleForFree": true
      },
      {
        "@type": "Article",
        "headline": `${homeName} x ${awayName} (${matchDateFormatted}) - ${translations.pt.estatiscaseo}`,
        "description": `${competitionName} - Previsão, estatísticas, melhor aposta e análise completa de ${homeName} x ${awayName}`,
        "image": getOgImage(currentLang),
        "author": {
          "@type": "Organization",
          "name": "GoalMetric"
        },
        "publisher": {
          "@type": "Organization",
          "name": "GoalMetric",
          "logo": {
            "@type": "ImageObject",
            "url": "https://goalmetric.online/logo.png"
          }
        },
        "datePublished": match.created_at || match.match_date,
        "dateModified": match.updated_at || new Date().toISOString(),
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://goalmetric.online/${lang}/match/${slug}`
        },
        "articleSection": "Previsões de Futebol",
        "keywords": [
          `${homeName} x ${awayName}`,
          `previsão ${homeName} x ${awayName}`,
          `melhor aposta ${homeName} x ${awayName}`,
          `análise ${homeName} x ${awayName}`,
          `gols esperados ${homeName} x ${awayName}`,
          competitionName
        ]
      }
    ]
  };

  return (
    <>
      <Script
        id="json-ld-match"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <MatchDetailClient
        match={match}
        lang={lang}
        currentLang={currentLang}
      />
    </>
  );
}