import { es } from './es';
import { en } from './en';

export const languages = { es: 'Español', en: 'English' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'es';
export const dictionaries = { es, en };

export const t = (lang: Lang) => dictionaries[lang];

/** Rutas traducidas. La clave es interna; el valor es el segmento de URL en cada idioma. */
export const routes = {
  home: { es: '', en: '' },
  product: { es: 'productos', en: 'products' },
  privacy: { es: 'privacidad', en: 'privacy' },
  cookies: { es: 'cookies', en: 'cookies' },
  brand: { es: 'marca', en: 'marca' },
} as const;
export type RouteKey = keyof typeof routes;

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Construye una URL interna respetando el idioma y la ruta base del despliegue. */
export function href(lang: Lang, key: RouteKey, slug?: string, hash?: string): string {
  const parts = [lang === defaultLang ? '' : lang, routes[key][lang], slug].filter(Boolean);
  const path = parts.length ? `/${parts.join('/')}/` : '/';
  return `${BASE}${path}${hash ? `#${hash}` : ''}`;
}

/** Ruta absoluta de un recurso de /public. */
export const asset = (p: string) => `${BASE}/${p.replace(/^\//, '')}`;

/** Equivalente de la página actual en el otro idioma. */
export function alternate(lang: Lang, key: RouteKey, slug?: string) {
  const other: Lang = lang === 'es' ? 'en' : 'es';
  return { lang: other, url: href(other, key, slug) };
}
