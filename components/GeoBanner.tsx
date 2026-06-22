'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface BannerConfig {
  country: string;        // Código ISO (BR, PT, US, ES, etc)
  imageUrl: string;
  link: string;
  alt: string;
}

interface GeoBannerProps {
  position?: 'top' | 'sidebar';
  defaultBanner?: BannerConfig;
}

const banners: BannerConfig[] = [
  {
    country: 'BR',
    imageUrl: 'https://azwbalsmxgoiomapkcyk.supabase.co/storage/v1/object/public/bet-logos/1781563067030.jpg',
    link: 'https://amzn.to/4ep61Bo',
    alt: 'Lego Brasil',
  },
 {
    country: 'FR',
    imageUrl: 'https://azwbalsmxgoiomapkcyk.supabase.co/storage/v1/object/public/bet-logos/1781563067030.jpg',
    link: 'https://amzn.to/4os2h6O',
    alt: 'Lego França',
  },
{
    country: 'GB',
    imageUrl: 'https://azwbalsmxgoiomapkcyk.supabase.co/storage/v1/object/public/bet-logos/1781563067030.jpg',
    link: 'https://amzn.to/3SHAPGo',
    alt: 'Lego UK',
  },
  {
    country: 'ES',
    imageUrl: 'https://azwbalsmxgoiomapkcyk.supabase.co/storage/v1/object/public/bet-logos/1781563067030.jpg',
    link: 'https://amzn.to/4uDcEX4',
    alt: 'Lego Espanha',
  },
];

export default function GeoBanner({ position = 'top', defaultBanner }: GeoBannerProps) {
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectCountry = async () => {
      try {
        // Opção 1: ipapi.co (muito simples e gratuito)
        const res = await fetch('https://ipapi.co/json/', { 
          cache: 'no-store' 
        });
        const data = await res.json();
        
        setUserCountry(data.country_code || 'BR'); // fallback BR
      } catch (error) {
        console.error('Erro ao detectar país:', error);
        setUserCountry('BR'); // fallback seguro
      } finally {
        setLoading(false);
      }
    };

    detectCountry();
  }, []);

  // Encontra banner específico ou usa o default
  const currentBanner = banners.find(b => b.country === userCountry) || defaultBanner || {
    imageUrl: '/banners/default.jpg',
    link: 'https://seusite.com',
    alt: 'Banner Padrão',
  };

  if (loading) {
    return <div className="w-full h-64 bg-zinc-900 animate-pulse rounded-2xl" />;
  }

  return (
    <a 
      href={currentBanner.link} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block hover:opacity-95 transition-all"
    >
      <img
        src={currentBanner.imageUrl}
        alt={currentBanner.alt}
        className={`w-full h-auto max-h-[420px] md:max-h-[520px] object-contain mx-auto rounded-2xl shadow-xl ${
          position === 'top' ? 'mb-8' : ''
        }`}
      />
    </a>
  );
}