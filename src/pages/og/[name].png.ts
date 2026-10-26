import type { APIRoute } from 'astro';
import { renderOg } from '../../lib/og';
import { visibleProducts } from '../../config/products.config';
import { t } from '../../i18n';

type Props = { eyebrow: string; title: string; subtitle?: string; seed: string; accent?: string };

export function getStaticPaths() {
  const pages: { params: { name: string }; props: Props }[] = [];
  for (const lang of ['es', 'en'] as const) {
    const d = t(lang);
    pages.push({ params: { name: `home-${lang}` }, props: { eyebrow: d.story.heroEyebrow, title: d.story.heroTitle[0], subtitle: d.story.heroTitle[1], seed: 'apice-home' } });
    for (const p of visibleProducts) {
      pages.push({ params: { name: `product-${p.slug}-${lang}` }, props: { eyebrow: `${p[lang].sector} · ${d.products.status[p.status]}`, title: p.name, subtitle: p[lang].tagline, seed: p.slug, accent: p.accent } });
    }
  }
  pages.push({ params: { name: 'brand' }, props: { eyebrow: 'Brand Guidelines', title: 'Sistema de marca', subtitle: 'Rigor científico. Software de altura.', seed: 'apice-brand' } });
  return pages;
}

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOg(props as Props);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
