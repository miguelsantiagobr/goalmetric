// app/(site)/[lang]/register/page.tsx
import { Metadata } from 'next';
import RegisterForm from './RegisterForm';

const translations = {
  pt: {
    title: 'Criar Conta | GolMetric',
    description: 'Crie sua conta para acessar análises profissionais, previsões de placar, melhores apostas e estatísticas avançadas de futebol.',
    keywords: 'cadastro golmetric, criar conta, registro futebol, previsões',
  },
  en: {
    title: 'Create Account | GolMetric',
    description: 'Create your account to access professional football analysis, score predictions, best bets and advanced statistics.',
    keywords: 'golmetric register, create account, football predictions',
  },
  es: {
    title: 'Crear Cuenta | GolMetric',
    description: 'Crea tu cuenta para acceder a análisis profesionales, predicciones de marcador, mejores apuestas y estadísticas avanzadas de fútbol.',
    keywords: 'registro golmetric, crear cuenta, predicciones fútbol',
  },
  fr: {
    title: 'Créer un Compte | GolMetric',
    description: 'Créez votre compte pour accéder aux analyses professionnelles, prédictions de score, meilleurs paris et statistiques avancées de football.',
    keywords: 'inscription golmetric, créer compte, pronostics football',
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const currentLang = lang === 'br' ? 'pt' : lang || 'pt';
  const t = translations[currentLang as keyof typeof translations] || translations.pt;

  const baseUrl = 'https://goalmetric.com';

  return {
    title: t.title,
    description: t.description,
    keywords: t.keywords,
    openGraph: {
      title: t.title,
      description: t.description,
      url: `${baseUrl}/${lang}/register`,
      images: [
        {
          url: `${baseUrl}/og-register.jpg`,
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
      canonical: `${baseUrl}/${lang}/register`,
      languages: {
        'pt': `${baseUrl}/pt/register`,
        'en': `${baseUrl}/en/register`,
        'es': `${baseUrl}/es/register`,
        'fr': `${baseUrl}/fr/register`,
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RegisterPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const currentLang = lang === 'br' ? 'pt' : lang || 'pt';

  return <RegisterForm lang={lang} currentLang={currentLang} />;
}