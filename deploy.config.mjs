// Dónde se publica el sitio. Es el ÚNICO lugar que hay que tocar al cambiar de dominio.
// · GitHub Pages (actual): site = https://pol4720.github.io, base = /PMP-Enterprise
// · Dominio propio (p. ej. https://apice.io): site = 'https://apice.io', base = '/'
export const deploy = {
  site: process.env.SITE_URL ?? 'https://pol4720.github.io',
  base: process.env.BASE_PATH ?? '/PMP-Enterprise',
};
