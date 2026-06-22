import { Metadata } from 'next';
import ProfileClient from './ProfileClient';

type Props = {
  params: Promise<{ lang: string }>;
};

// ======================== SEO / METADATA DINÂMICO ========================
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;

  const seoTranslations: Record<string, { title: string; description: string }> = {
    br: { title: 'Meu Perfil | Goal Metric', description: 'Gerencie suas configurações de conta, idioma e preferências no Goal Metric.' },
    en: { title: 'My Profile | Goal Metric', description: 'Manage your account settings, language, and preferences on Goal Metric.' },
    es: { title: 'Mi Perfil | Goal Metric', description: 'Gestione la configuración de su cuenta, idioma y preferencias en Goal Metric.' },
    fr: { title: 'Mon Profil | Goal Metric', description: 'Gérez les paramètres de votre compte, votre langue et vos préférences sur Goal Metric.' },
  };

  const seo = seoTranslations[lang] || seoTranslations.br;

  return {
    title: seo.title,
    description: seo.description,
    robots: { index: false, follow: true }, // Geralmente páginas de perfil não devem ser indexadas no Google
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: 'website',
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { lang } = await params;
  
  return <ProfileClient lang={lang} />;
}