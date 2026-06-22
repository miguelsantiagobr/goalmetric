// scripts/generate-sitemap.ts
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERRO: Variáveis do Supabase não encontradas no .env.local');
  console.error('Verifique se o arquivo .env.local existe na raiz do projeto.');
  process.exit(1);
}

const BASE_URL = 'https://goalmetric.online';
const languages = ['pt', 'en', 'es', 'fr'];
const BATCH_SIZE = 6000;

async function generateSitemap() {
  console.log('🔄 Gerando Sitemap Index...');

  const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

  const { data: matches, error } = await supabase
    .from('matches')
    .select('slug, match_date')
    .order('match_date', { ascending: false });

  if (error) {
    console.error('❌ Erro ao buscar partidas:', error.message);
    return;
  }

  const totalUrls = (matches?.length || 0) * languages.length;
  console.log(`📊 Total de URLs: ${totalUrls} (${matches?.length || 0} partidas)`);

  const sitemaps: string[] = [];
  const totalBatches = Math.ceil(totalUrls / BATCH_SIZE);

  for (let i = 0; i < totalBatches; i++) {
    const start = i * BATCH_SIZE;
    const batchMatches = matches?.slice(
      Math.floor(start / languages.length),
      Math.ceil((start + BATCH_SIZE) / languages.length)
    ) || [];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    if (i === 0) {
      xml += `  <url><loc>${BASE_URL}</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;
      languages.forEach(lang => {
        xml += `  <url><loc>${BASE_URL}/${lang}</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
      });
    }

    batchMatches.forEach((m: any) => {
      languages.forEach(lang => {
        xml += `  <url><loc>${BASE_URL}/${lang}/match/${m.slug}</loc><lastmod>${m.match_date || new Date().toISOString().split('T')[0]}</lastmod><changefreq>weekly</changefreq><priority>0.85</priority></url>\n`;
      });
    });

    xml += '</urlset>';

    const filename = i === 0 ? 'sitemap.xml' : `sitemap-${i + 1}.xml`;
    writeFileSync(path.join(process.cwd(), 'public', filename), xml);
    sitemaps.push(filename);

    console.log(`✅ ${filename} → ${batchMatches.length * languages.length} URLs`);
  }

  let indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  sitemaps.forEach(filename => {
    indexXml += `  <sitemap><loc>${BASE_URL}/${filename}</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod></sitemap>\n`;
  });

  indexXml += '</sitemapindex>';

  writeFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), indexXml);

  console.log(`🎉 Sitemap Index gerado com ${sitemaps.length} arquivo(s)!`);
}

generateSitemap().catch(console.error);