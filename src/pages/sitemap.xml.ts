import type { APIRoute } from 'astro';
import { visibleProducts } from '../config/products.config';
import { href, type Lang, type RouteKey } from '../i18n';

/** Sitemap generado desde la configuración: cada producto nuevo aparece aquí automáticamente. */
export const GET: APIRoute = ({ site }) => {
  const base = (site?.href ?? '').replace(/\/$/, '');
  const today = new Date().toISOString().slice(0, 10);
  const entries: { key: RouteKey; slug?: string; priority: string; bilingual: boolean }[] = [
    { key: 'home', priority: '1.0', bilingual: true },
    ...visibleProducts.map((p) => ({ key: 'product' as const, slug: p.slug, priority: '0.8', bilingual: true })),
    { key: 'privacy', priority: '0.3', bilingual: true },
    { key: 'cookies', priority: '0.3', bilingual: true },
    { key: 'brand', priority: '0.4', bilingual: false },
  ];
  const langs: Lang[] = ['es', 'en'];
  const urls = entries.flatMap((e) => (e.bilingual ? langs : (['es'] as Lang[])).map((lang) => {
    const alts = e.bilingual ? langs.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${base}${href(l, e.key, e.slug)}"/>`).join('') : '';
    return `<url><loc>${base}${href(lang, e.key, e.slug)}</loc><lastmod>${today}</lastmod><priority>${e.priority}</priority>${alts}</url>`;
  }));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join('')}</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
