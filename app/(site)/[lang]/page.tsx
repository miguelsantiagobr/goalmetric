// app/(site)/[lang]/page.tsx
import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import HomeClient from './HomeClient';
import GeoBanner from '@/components/GeoBanner';   // ← Import do componente de banners

// ======================== TRADUÇÕES PARA SEO ========================
const translations = {
  pt: {
    title: 'GolMetric - Análises Profissionais de Futebol',
    description: 'Previsões, análises estatísticas e melhores apostas em jogos de futebol. Acompanhe as principais ligas com dados precisos e atualizados.',
    keywords: 'futebol, análises, previsões, apostas esportivas, golmetric, premier league, champions league',
  },
  en: {
    title: 'GolMetric - Professional Football Analysis',
    description: 'Accurate football predictions, statistical analysis and best bets. Follow major leagues with real-time data and expert insights.',
    keywords: 'football, soccer, predictions, betting tips, golmetric, premier league, champions league',
  },
  es: {
    title: 'GolMetric - Análisis Profesional de Fútbol',
    description: 'Predicciones precisas, análisis estadísticos y mejores apuestas de fútbol. Sigue las principales ligas con datos en tiempo real.',
    keywords: 'fútbol, predicciones, apuestas deportivas, golmetric, premier league, champions league',
  },
  fr: {
    title: 'GolMetric - Analyse Professionnelle de Football',
    description: 'Prédictions précises, analyses statistiques et meilleurs paris football. Suivez les grands championnats avec des données fiables.',
    keywords: 'football, pronostics, paris sportifs, golmetric, premier league, champions league',
  },
} as const;

// ======================== GENERATE METADATA ========================
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  const currentLang =
    lang === "br" ? "pt" : lang || "pt";

  const t =
    translations[currentLang as keyof typeof translations] ??
    translations.pt;

  const baseUrl = "https://goalmetric.online";

  return {
    metadataBase: new URL(baseUrl),

    title: t.title,
    description: t.description,
    keywords: t.keywords,

    openGraph: {
      title: t.title,
      description: t.description,
      url: `${baseUrl}/${lang}`,
      siteName: "GolMetric",
      images: [
        {
          url: `${baseUrl}/og-home.jpg`,
          width: 1200,
          height: 630,
          alt: "GolMetric - Análises de Futebol",
        },
      ],
      locale: currentLang === "pt" ? "pt_BR" : currentLang,
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title: t.title,
      description: t.description,
    },

    alternates: {
      canonical: `/${lang}`,
      languages: {
        pt: "/pt",
        en: "/en",
        es: "/es",
        fr: "/fr",
        "x-default": "/pt",
      },
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

// ======================== CARREGAMENTO DE DADOS ========================
async function getMatches() {
  const { data } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!home_team_id(name_pt, name_en, name_es, name_fr, logo_url),
      away_team:teams!away_team_id(name_pt, name_en, name_es, name_fr, logo_url),
      competition:competitions(name_pt, name_en, name_es, name_fr, logo_url)
    `)
    .gte('match_date', new Date().toISOString().split('T')[0])
    .order('match_date', { ascending: true })
    .order('match_time', { ascending: true });


  return data || [];
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const currentLang = lang === 'br' ? 'pt' : lang || 'pt';

  const matches = await getMatches();

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* ==================== BANNER NO TOPO ==================== */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
  <GeoBanner 
    position="top" 
    defaultBanner={{
      country: 'DEFAULT',
      imageUrl: 'https://azwbalsmxgoiomapkcyk.supabase.co/storage/v1/object/public/bet-logos/1781563067030.jpg',
      link: 'https://amzn.to/4uB7smA',
      alt: 'Banner Lego'
    }}
  />
</div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <HomeClient 
          lang={lang} 
          currentLang={currentLang} 
          initialMatches={matches} 
        />
      </div>
    </div>
  );
}