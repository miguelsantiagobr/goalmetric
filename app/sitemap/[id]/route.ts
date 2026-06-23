import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const BASE_URL = 'https://goalmetric.online';
const BATCH_SIZE = 6000;
const languages = ['pt', 'en', 'es', 'fr'];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const sitemapId = parseInt(resolvedParams.id, 10);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const matchesPerBatch = Math.ceil(BATCH_SIZE / languages.length);
  const from = sitemapId * matchesPerBatch;
  const to = from + matchesPerBatch - 1;

  const { data: matches } = await supabase
    .from('matches')
    .select('slug, match_date')
    .order('match_date', { ascending: false })
    .range(from, to);

  const currentDate = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  if (sitemapId === 0) {
    xml += `  <url><loc>${BASE_URL}</loc><lastmod>${currentDate}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;
    languages.forEach(lang => {
      xml += `  <url><loc>${BASE_URL}/${lang}</loc><lastmod>${currentDate}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
    });
  }

  matches?.forEach((m: any) => {
    const lastModDate = m.match_date 
      ? new Date(m.match_date).toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' })
      : currentDate;

    languages.forEach(lang => {
      xml += `  <url><loc>${BASE_URL}/${lang}/match/${m.slug}</loc><lastmod>${lastModDate}</lastmod><changefreq>weekly</changefreq><priority>0.85</priority></url>\n`;
    });
  });

  xml += '</urlset>';

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
    },
  });
}