import type { APIRoute } from 'astro';
export const GET: APIRoute = ({ site }) => {
  const base = (site?.href ?? '').replace(/\/$/, '') + import.meta.env.BASE_URL.replace(/\/$/, '');
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`, { headers: { 'Content-Type': 'text/plain' } });
};
