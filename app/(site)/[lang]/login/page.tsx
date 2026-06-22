// app/(site)/[lang]/login/page.tsx
import { Metadata } from 'next';
import LoginForm from './LoginForm';

const translations = {
  pt: {
    title: 'Entrar | GolMetric',
    description: 'Faça login para acessar análises profissionais, previsões e estatísticas de futebol.',
    keywords: 'login golmetric, entrar, acessar previsões futebol',
  },
  en: {
    title: 'Login | GolMetric',
    description: 'Sign in to access professional football analysis, predictions and statistics.',
    keywords: 'golmetric login, sign in, football predictions',
  },
  es: {
    title: 'Iniciar Sesión | GolMetric',
    description: 'Inicia sesión para acceder a análisis profesionales, predicciones y estadísticas de fútbol.',
    keywords: 'login golmetric, iniciar sesión, predicciones fútbol',
  },
  fr: {
    title: 'Connexion | GolMetric',
    description: 'Connectez-vous pour accéder aux analyses professionnelles, prédictions et statistiques de football.',
    keywords: 'connexion golmetric, login, pronostics football',
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const currentLang = lang === 'br' ? 'pt' : lang || 'pt';
  const t = translations[currentLang as keyof typeof translations] || translations.pt;

  const baseUrl = 'https://goalmetric.com'; // ← Altere para seu domínio real

  return {
    title: t.title,
    description: t.description,
    keywords: t.keywords,
    openGraph: {
      title: t.title,
      description: t.description,
      url: `${baseUrl}/${lang}/login`,
      images: [
        {
          url: `${baseUrl}/og-login.jpg`, // Recomendado criar esta imagem
          width: 1200,
          height: 630,
          alt: t.title,
        },
      ],
      locale: currentLang === 'pt' ? 'pt_BR' : currentLang,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t.title,
      description: t.description,
    },
    alternates: {
      canonical: `${baseUrl}/${lang}/login`,
      languages: {
        'pt': `${baseUrl}/pt/login`,
        'en': `${baseUrl}/en/login`,
        'es': `${baseUrl}/es/login`,
        'fr': `${baseUrl}/fr/login`,
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LoginPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const currentLang = lang === 'br' ? 'pt' : lang || 'pt';

  return <LoginForm lang={lang} currentLang={currentLang} />;
}