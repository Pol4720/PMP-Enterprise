import { defineConfig } from 'astro/config';
import { deploy } from './deploy.config.mjs';

export default defineConfig({
  site: deploy.site,
  base: deploy.base,
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  vite: {
    build: { chunkSizeWarningLimit: 900 },
  },
});
