import type { APIRoute } from 'astro';
import { site } from '../config/site.config';
export const GET: APIRoute = () => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return new Response(JSON.stringify({
    name: site.name, short_name: site.name, start_url: `${base}/`, display: 'standalone',
    background_color: '#0F1C26', theme_color: site.themeColor,
    icons: [
      { src: `${base}/icon-192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${base}/icon-512.png`, sizes: '512x512', type: 'image/png' },
      { src: `${base}/icon-maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }, null, 2), { headers: { 'Content-Type': 'application/manifest+json' } });
};
