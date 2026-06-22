// app/api/sitemap/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const BASE_URL = 'https://goalmetric.online';

export async function POST(request: NextRequest) {
  
  // ======================== VERIFICAÇÃO DO SECRET ========================
  const authHeader = request.headers.get('authorization');
  
  if (authHeader !== `Bearer ${process.env.SITEMAP_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: matches } = await supabase
      .from('matches')
      .select('slug, match_date')
      .order('match_date', { ascending: false });

    const languages = ['pt', 'en', 'es', 'fr'];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Páginas principais
    xml += `  <url><loc>${BASE_URL}</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;
    
    languages.forEach(lang => {
      xml += `  <url><loc>${BASE_URL}/${lang}</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
    });

    // Partidas
    matches?.forEach((m: any) => {
      languages.forEach(lang => {
        xml += `  <url><loc>${BASE_URL}/${lang}/match/${m.slug}</loc><lastmod>${m.match_date || new Date().toISOString().split('T')[0]}</lastmod><changefreq>weekly</changefreq><priority>0.85</priority></url>\n`;
      });
    });

    xml += '</urlset>';

    const filePath = path.join(process.cwd(), 'public', 'sitemap.xml');
    writeFileSync(filePath, xml);

    console.log(`✅ Sitemap atualizado automaticamente! (${matches?.length} partidas)`);

    return NextResponse.json({ 
      success: true, 
      message: `Sitemap gerado com ${matches?.length} partidas` 
    });

  } catch (error) {
    console.error('Erro ao gerar sitemap:', error);
    return NextResponse.json({ error: 'Falha ao gerar sitemap' }, { status: 500 });
  }
}