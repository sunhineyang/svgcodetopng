import http from 'http';
import { URL } from 'url';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

interface ExpectedTDK {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  twitterTitle: string;
}

const EXPECTED_TDK: Record<string, ExpectedTDK> = {
  fr: {
    title: 'Convertisseur Code SVG en PNG - Outil en Ligne Gratuit',
    description: 'Convertissez le code SVG en images PNG gratuitement en ligne. Support de fond transparent, haute qualité, conversion instantanée. Convertisseur de code SVG sans inscription.',
    ogTitle: 'Convertisseur Code SVG en PNG - Outil en Ligne Gratuit',
    ogDescription: 'Conversion instantanée de code SVG en images PNG. Convertisseur de code SVG en ligne gratuit avec support de fond transparent.',
    twitterTitle: 'Convertisseur Code SVG en PNG - Outil en Ligne Gratuit',
  },
  ja: {
    title: 'SVGコードをPNG画像に変換 - 無料オンラインツール | 高品質',
    description: 'SVGコードをPNG画像に無料でオンライン変換。透明背景対応、高品質出力、即時変換。登録不要で簡単にSVGコード変換が可能。',
    ogTitle: 'SVGコードをPNG画像に変換 - 無料オンラインツール',
    ogDescription: 'SVGコードをPNG画像に即時変換。透明背景対応の無料オンライン変換ツール。',
    twitterTitle: 'SVGコードをPNG画像に変換 - 無料オンラインツール',
  },
  it: {
    title: 'Convertitore Codice SVG in PNG - Strumento Online Gratuito',
    description: 'Converti codice SVG in immagini PNG gratis online. Supporto sfondo trasparente, alta qualità, conversione istantanea. Convertitore di codice SVG senza registrazione.',
    ogTitle: 'Convertitore Codice SVG in PNG - Strumento Gratuito',
    ogDescription: 'Conversione istantanea di codice SVG in immagini PNG. Convertitore di codice SVG online gratuito con supporto sfondo trasparente.',
    twitterTitle: 'Convertitore Codice SVG in PNG - Strumento Gratuito',
  },
  pt: {
    title: 'Conversor de Código SVG para PNG - Ferramenta Online Grátis',
    description: 'Converta código SVG em imagens PNG grátis online. Suporte de fundo transparente, alta qualidade, conversão instantânea. Conversor de código SVG sem registro.',
    ogTitle: 'Conversor de Código SVG para PNG - Ferramenta Grátis',
    ogDescription: 'Conversão instantânea de código SVG em imagens PNG. Conversor de código SVG online gratuito com suporte de fundo transparente.',
    twitterTitle: 'Conversor de Código SVG para PNG - Ferramenta Grátis',
  },
};

function fetchHtml(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options: http.RequestOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      timeout: 15000,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout for ${url}`));
    });

    req.end();
  });
}

function extractMeta(html: string, selector: string, attr: string): string | null {
  // Simple regex-based extraction for specific meta tags.
  const regex = new RegExp(`<${selector}[^>]*${attr}=["']([^"']+)["'][^>]*>`, 'i');
  const match = html.match(regex);
  return match ? match[1] : null;
}

function extractTitle(html: string): string | null {
  const match = html.match(/<title>([^]*?)<\/title>/i);
  return match ? match[1].trim() : null;
}

function extractLang(html: string): string | null {
  const match = html.match(/<html[^>]*\s+lang=["']([^"']+)["'][^>]*>/i);
  return match ? match[1] : null;
}

async function testLocale(locale: string, expected: ExpectedTDK): Promise<void> {
  const url = `${BASE_URL}/${locale}/`;
  const html = await fetchHtml(url);

  const title = extractTitle(html);
  const description = extractMeta(html, 'meta name="description"', 'content');
  const ogTitle = extractMeta(html, 'meta property="og:title"', 'content');
  const ogDescription = extractMeta(html, 'meta property="og:description"', 'content');
  const twitterTitle = extractMeta(html, 'meta name="twitter:title"', 'content');
  const lang = extractLang(html);

  const checks = [
    { name: 'title', actual: title, expected: expected.title },
    { name: 'description', actual: description, expected: expected.description },
    { name: 'og:title', actual: ogTitle, expected: expected.ogTitle },
    { name: 'og:description', actual: ogDescription, expected: expected.ogDescription },
    { name: 'twitter:title', actual: twitterTitle, expected: expected.twitterTitle },
    { name: 'html lang', actual: lang, expected: locale },
  ];

  for (const check of checks) {
    if (check.actual !== check.expected) {
      throw new Error(
        `[${locale}] ${check.name} mismatch.\nExpected: ${check.expected}\nActual:   ${check.actual}`,
      );
    }
  }

  console.log(`✅ ${locale}: all TDK checks passed`);
}

async function testRegression(url: string, expectedTitle: string): Promise<void> {
  const html = await fetchHtml(url);
  const title = extractTitle(html);
  if (title !== expectedTitle) {
    throw new Error(`[${url}] title regression failed.\nExpected: ${expectedTitle}\nActual:   ${title}`);
  }
  console.log(`✅ ${url}: regression title unchanged`);
}

async function main(): Promise<void> {
  const failures: string[] = [];

  for (const [locale, expected] of Object.entries(EXPECTED_TDK)) {
    try {
      await testLocale(locale, expected);
    } catch (err) {
      const message = err instanceof Error ? err.stack || err.message : String(err);
      console.error(`❌ ${locale} failed:`);
      console.error(message);
      failures.push(locale);
    }
  }

  try {
    await testRegression(`${BASE_URL}/`, 'SVG Code to PNG Converter (PNG, JPG, GIF) | Free Online Tool');
  } catch (err) {
    const message = err instanceof Error ? err.stack || err.message : String(err);
    console.error(`❌ en regression failed:`);
    console.error(message);
    failures.push('en-regression');
  }

  try {
    await testRegression(`${BASE_URL}/ko/`, 'SVG 코드를 PNG 변환기 (PNG, JPG, GIF) | 무료 온라인 도구');
  } catch (err) {
    const message = err instanceof Error ? err.stack || err.message : String(err);
    console.error(`❌ ko regression failed:`);
    console.error(message);
    failures.push('ko-regression');
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} test group(s) failed: ${failures.join(', ')}`);
    process.exit(1);
  }

  console.log('\nAll TDK tests passed.');
}

main();
