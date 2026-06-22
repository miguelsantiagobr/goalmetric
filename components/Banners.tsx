'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Banner = {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
  position: 'top' | 'sidebar';
  language: string;
  active: boolean;
};

export default function Banners({ position }: { position: 'top' | 'sidebar' }) {
  const pathname = usePathname();
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);

  // Detecta o idioma pela URL (/br, /en, /es, /fr)
  const getCurrentLanguage = (): string => {
    if (pathname?.startsWith('/br')) return 'pt';
    if (pathname?.startsWith('/en')) return 'en';
    if (pathname?.startsWith('/es')) return 'es';
    if (pathname?.startsWith('/fr')) return 'fr';
    return 'pt'; // padrão
  };

  useEffect(() => {
    const fetchBanner = async () => {
      const lang = getCurrentLanguage();

      const { data } = await supabase
        .from('banners')
        .select('*')
        .eq('position', position)
        .eq('language', lang)
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setBanner(data);
      setLoading(false);
    };

    fetchBanner();
  }, [pathname, position]);

  if (loading || !banner) return null;

  return (
    <a
      href={banner.link_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block hover:brightness-110 transition-all duration-300 overflow-hidden rounded-3xl"
    >
      <img
  src={banner.image_url}
  alt={banner.title}
  className={`w-full h-auto max-h-[420px] md:max-h-[520px] object-contain mx-auto ${
    position === 'top' ? 'rounded-2xl' : ''
  }`}
/>
    </a>
  );
}