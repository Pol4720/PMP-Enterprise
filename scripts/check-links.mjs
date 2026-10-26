// Verifica que todos los enlaces y recursos internos de dist/ apuntan a archivos existentes.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { deploy } from '../deploy.config.mjs';

const dist = resolve('dist');
const base = deploy.base.replace(/\/$/, '');
const files = [];
const walk = (d) => readdirSync(d).forEach((f) => { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && files.push(p); });
walk(dist);
const broken = [];
for (const f of files) {
  const html = readFileSync(f, 'utf8');
  for (const [, url] of html.matchAll(/(?:href|src)="([^"#?]+)[^"]*"/g)) {
    if (!url.startsWith(base + '/') && url !== base) continue;
    let rel = url.slice(base.length) || '/';
    let target = join(dist, decodeURIComponent(rel));
    if (rel.endsWith('/')) target = join(target, 'index.html');
    if (!existsSync(target)) broken.push(`${f.replace(dist, '')} → ${url}`);
  }
}
if (broken.length) { console.error('Enlaces rotos:\n' + [...new Set(broken)].join('\n')); process.exit(1); }
console.log(`✓ ${files.length} páginas revisadas, sin enlaces internos rotos.`);
