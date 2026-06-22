'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface BannerConfig {
  country: string;        // Código ISO (BR, PT, US, ES, GB, etc)
  imageUrl: string;
  link: string;
  alt: string;
}

interface GeoBannerSidebarProps {
  defaultBanner?: BannerConfig;
}

const sidebarBanners: BannerConfig[] = [
  {
    country: 'BR',
    imageUrl: 'https://azwbalsmxgoiomapkcyk.supabase.co/storage/v1/object/public/bet-logos/1781588039580.jpg',
    link: 'https://referme.to/michaelsmithmarcelinol-7',
      alt: 'Betano',
  },
  {
    country: 'FR',
    imageUrl: 'https://azwbalsmxgoiomapkcyk.supabase.co/storage/v1/object/public/bet-logos/1781563067030.jpg',
    link: 'https://amzn.to/4os2h6O',
    alt: 'Lego França - Amazon',
  },
  {
    country: 'GB',
    imageUrl: 'https://azwbalsmxgoiomapkcyk.supabase.co/storage/v1/object/public/bet-logos/1781563067030.jpg',
    link: 'https://amzn.to/3SHAPGo',
    alt: 'Lego UK - Amazon',
  },
  {
    country: 'ES',
    imageUrl: 'https://azwbalsmxgoiomapkcyk.supabase.co/storage/v1/object/public/bet-logos/1781563067030.jpg',
    link: 'https://amzn.to/4uDcEX4',
    alt: 'Lego Espanha - Amazon',
  },
];

export default function GeoBannerSidebar({ defaultBanner }: GeoBannerSidebarProps) {
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectCountry = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/', { 
          cache: 'no-store',
          headers: { 'Accept': 'application/json' }
        });
        
        if (!res.ok) throw new Error('Falha na API');
        
        const data = await res.json();
        setUserCountry(data.country_code || 'BR');
      } catch (error) {
        console.error('Erro ao detectar país:', error);
        setUserCountry('BR'); // Fallback seguro
      } finally {
        setLoading(false);
      }
    };

    detectCountry();
  }, []);

  // Busca banner específico ou usa default
  const currentBanner = sidebarBanners.find(b => b.country === userCountry) || defaultBanner || {
    imageUrl: 'https://azwbalsmxgoiomapkcyk.supabase.co/storage/v1/object/public/bet-logos/1781563067030.jpg',
    link: 'https://amzn.to/4ep61Bo', // Link padrão (Brasil)
    alt: 'Banner Amazon',
  };

  if (loading) {
    return (
      <div className="w-full max-w-[350px] mx-auto h-[300px] bg-zinc-900 animate-pulse rounded-2xl" />
    );
  }

  return (
    <a 
      href={currentBanner.link} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block hover:scale-[1.02] transition-transform duration-300"
    >
      <img
        src={currentBanner.imageUrl}
        alt={currentBanner.alt}
        className="w-full h-auto max-h-[380px] object-contain mx-auto rounded-2xl shadow-lg border border-zinc-800"
      />
    </a>
  );
}