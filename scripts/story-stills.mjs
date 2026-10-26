// Captura las láminas estáticas de la historia (versión para movimiento reducido o sin WebGL).
// Uso: npm run build && npm run preview (en otra terminal) && npm run story:stills
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const url = process.argv[2] ?? 'http://localhost:4321/PMP-Enterprise/';
const out = resolve(root, 'public/story');
mkdirSync(out, { recursive: true });
const frames = { ruido: 0.13, estructura: 0.315, modelo: 0.46, ascenso: 0.6, cima: 0.72, cordillera: 0.875 };

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto(url, { waitUntil: 'load' });
await page.addStyleTag({ content: '.site-header,.chapters,.altimeter,.hero,.hint,.skip-story,.outro,.veil{display:none!important}' });
await page.waitForFunction(() => document.querySelector('[data-story]')?.classList.contains('is-ready'), null, { timeout: 60000 });
for (const [id, f] of Object.entries(frames)) {
  await page.evaluate((f) => { const s = document.querySelector('[data-story]'); scrollTo(0, s.offsetTop + (s.offsetHeight - innerHeight) * f); }, f);
  await page.waitForTimeout(3000);
  const png = await page.screenshot();
  await sharp(png).webp({ quality: 80 }).toFile(resolve(out, `${id}.webp`));
  console.log('✓', id);
}
await browser.close();
