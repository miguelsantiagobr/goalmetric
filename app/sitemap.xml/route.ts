import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const BASE_URL = 'https://goalmetric.online';
const BATCH_SIZE = 6000;
const languages = ['pt', 'en', 'es', 'fr'];

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { count } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true });

  const totalUrls = (count || 0) * languages.length;
  const totalSitemaps = Math.ceil(totalUrls / BATCH_SIZE);

  // Gera a data atual formatada no fuso do Brasil uma única vez
  const currentDate = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });

  let indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Gera as referências para sitemap/0.xml, sitemap/1.xml, etc.
  for (let i = 0; i < totalSitemaps; i++) {
    indexXml += `  <sitemap>
    <loc>${BASE_URL}/sitemap/${i}.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>\n`;
  }

  indexXml += '</sitemapindex>';

  return new NextResponse(indexXml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600', // Cache de 24h na Vercel
    },
  });
}