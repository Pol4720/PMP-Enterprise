// Genera todas las variantes del logo de Ápice como SVG con el texto convertido a trazos.
// Uso: npm run brand:build
import opentype from 'opentype.js';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const C = { ink: '#0F1C26', mist: '#EEF1F0', gold: '#D9A441', glacier: '#25707A', black: '#000000', white: '#FFFFFF' };

// ── Isotipo ───────────────────────────────────────────────────────────────
// Tres crestas paralelas (curvas de nivel en sección) forman la A;
// la tilde de la Á es el rombo dorado: la cima.
// Retícula de 64×64.
// Pico asimétrico, como una montaña real: cara izquierda abrupta, derecha más tendida.
// Cada cresta interior se desplaza hacia la ladera suave, igual que las curvas de nivel.
const BASE = 56, SL = 0.56, SR = 0.74; // pendientes (dx/dy) izquierda y derecha
const TOP = { x: 27, y: 14 };
// Cada cresta interior es un desplazamiento paralelo de la exterior (separación constante).
const offsetApex = (d) => {
  const kL = d * Math.hypot(1, SL), kR = d * Math.hypot(1, SR);
  // xa - SL(y-ya) + kL = xa + SR(y-ya) - kR  →  y - ya = (kL + kR)/(SL + SR)
  const dy = (kL + kR) / (SL + SR);
  return { x: +(TOP.x + SR * dy - kR).toFixed(2), y: +(TOP.y + dy).toFixed(2) };
};
const ridges = [
  { ...offsetApex(0), w: 4.8 },
  { ...offsetApex(7.2), w: 3.8 },
  { ...offsetApex(14.4), w: 2.8 },
];
const chevron = ({ x, y }) => {
  const h = BASE - y;
  return `M${(x - h * SL).toFixed(2)} ${BASE}L${x} ${y}L${(x + h * SR).toFixed(2)} ${BASE}`;
};
const APEX = { x: 27, y: 5.6, r: 4.4 };
const diamond = (cx, cy, r) => `M${cx} ${cy - r}L${cx + r} ${cy}L${cx} ${cy + r}L${cx - r} ${cy}Z`;
const isoParts = (stroke, gold) =>
  ridges.map((r, i) => `<path class="r r${i + 1}" d="${chevron(r)}" fill="none" stroke="${stroke}" stroke-width="${r.w}" stroke-linecap="round" stroke-linejoin="round"/>`).join('') +
  `<path class="apex" d="${diamond(APEX.x, APEX.y, APEX.r)}" fill="${gold}"/>`;

// ── Logotipo ──────────────────────────────────────────────────────────────
const font = opentype.parse(readFileSync(resolve(root, 'node_modules/@fontsource/newsreader/files/newsreader-latin-500-normal.woff')).buffer);
const FS = 100;
function wordmark() {
  const text = 'Apice';
  const glyphs = font.stringToGlyphs(text);
  let x = 0; const paths = []; const pos = [];
  const tracking = -0.5; // ajuste óptico
  glyphs.forEach((g, i) => {
    const p = g.getPath(x, 0, FS);
    paths.push(p.toPathData(2));
    pos.push({ x, w: g.advanceWidth * FS / font.unitsPerEm });
    x += g.advanceWidth * FS / font.unitsPerEm + tracking;
  });
  const xh = (font.tables.os2.sxHeight || 500) * FS / font.unitsPerEm;
  const cap = (font.tables.os2.sCapHeight || 700) * FS / font.unitsPerEm;
  // Tilde = rombo dorado sobre el vértice de la «A»
  const bbA = glyphs[0].getPath(0, 0, FS).getBoundingBox();
  const acc = { cx: +((bbA.x1 + bbA.x2) / 2 + 3).toFixed(2), cy: +(bbA.y1 - 13).toFixed(2), r: 7.4 };
  const bb = new opentype.Path(); paths; // noop
  const asc = cap + 24, desc = 0.24 * FS;
  return { d: paths.join(''), width: x, xh, acc, asc, desc };
}
const wm = wordmark();

const svg = (vb, body, title, extra = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-labelledby="t"${extra}><title id="t">${title}</title>${body}</svg>\n`;

function isotipo(stroke, gold, bg) {
  const b = bg ? `<rect width="64" height="64" fill="${bg}"/>` : '';
  return svg('0 0 64 64', b + isoParts(stroke, gold), 'Ápice');
}
function horizontal(ink, gold) {
  // isotipo a la altura de la x + ascendente; logotipo a la derecha
  const s = (wm.asc + 6) / 64; const gap = 26;
  const isoW = 64 * s; const ty = wm.asc;
  const body = `<g transform="translate(0 ${-6}) scale(${s.toFixed(4)})">${isoParts(ink, gold)}</g>` +
    `<g transform="translate(${(isoW + gap).toFixed(2)} ${ty.toFixed(2)})"><path d="${wm.d}" fill="${ink}"/><path d="${diamond(wm.acc.cx, wm.acc.cy, wm.acc.r)}" fill="${gold}"/></g>`;
  const W = isoW + gap + wm.width; const H = wm.asc + wm.desc;
  return svg(`-2 -8 ${(W + 4).toFixed(1)} ${(H + 12).toFixed(1)}`, body, 'Ápice');
}
function vertical(ink, gold) {
  const isoS = 1.9; const isoW = 64 * isoS; const W = Math.max(isoW, wm.width);
  const body = `<g transform="translate(${((W - isoW) / 2).toFixed(2)} 0) scale(${isoS})">${isoParts(ink, gold)}</g>` +
    `<g transform="translate(${((W - wm.width) / 2).toFixed(2)} ${(isoW + 34 + wm.asc).toFixed(2)})"><path d="${wm.d}" fill="${ink}"/><path d="${diamond(wm.acc.cx, wm.acc.cy, wm.acc.r)}" fill="${gold}"/></g>`;
  const H = isoW + 34 + wm.asc + wm.desc;
  return svg(`-4 -4 ${(W + 8).toFixed(1)} ${(H + 8).toFixed(1)}`, body, 'Ápice');
}
function wordmarkOnly(ink, gold) {
  const body = `<g transform="translate(0 ${wm.asc})"><path d="${wm.d}" fill="${ink}"/><path d="${diamond(wm.acc.cx, wm.acc.cy, wm.acc.r)}" fill="${gold}"/></g>`;
  return svg(`-2 -2 ${(wm.width + 4).toFixed(1)} ${(wm.asc + wm.desc + 4).toFixed(1)}`, body, 'Ápice');
}

// Logo animado (CSS dentro del SVG; respeta prefers-reduced-motion)
function animated(ink, gold) {
  const s = (wm.asc + 6) / 64; const gap = 26; const isoW = 64 * s;
  const css = `<style>
.r{stroke-dasharray:120;stroke-dashoffset:120;animation:draw 1.4s cubic-bezier(.65,0,.35,1) forwards}
.r2{animation-delay:.18s}.r3{animation-delay:.36s}
.apex{transform-origin:27px 5.6px;transform:translateY(-14px) rotate(-90deg) scale(.2);opacity:0;animation:drop .9s cubic-bezier(.2,.9,.2,1) 1.1s forwards}
.wm{opacity:0;transform:translateX(-12px);animation:wm 1s cubic-bezier(.2,.8,.2,1) .6s forwards}
.acc{opacity:0;transform-box:fill-box;transform-origin:center;transform:scale(0) rotate(-90deg);animation:acc .7s cubic-bezier(.2,.9,.2,1) 1.5s forwards}
.glow{opacity:0;transform-box:fill-box;transform-origin:center;animation:glow 2.4s ease-out 1.7s}
@keyframes draw{to{stroke-dashoffset:0}}
@keyframes drop{to{transform:none;opacity:1}}
@keyframes wm{to{opacity:1;transform:none}}
@keyframes acc{to{opacity:1;transform:none}}
@keyframes glow{0%{opacity:.75;transform:scale(.4)}100%{opacity:0;transform:scale(2.6)}}
@media (prefers-reduced-motion:reduce){.r,.apex,.wm,.acc{animation:none;stroke-dashoffset:0;opacity:1;transform:none}.glow{display:none}}
</style>`;
  const body = css + `<g transform="translate(0 -6) scale(${s.toFixed(4)})"><circle class="glow" cx="27" cy="5.6" r="9" fill="${gold}"/>${isoParts(ink, gold)}</g>` +
    `<g transform="translate(${(isoW + gap).toFixed(2)} ${wm.asc.toFixed(2)})"><g class="wm"><path d="${wm.d}" fill="${ink}"/></g><path class="acc" d="${diamond(wm.acc.cx, wm.acc.cy, wm.acc.r)}" fill="${gold}"/></g>`;
  const W = isoW + gap + wm.width; const H = wm.asc + wm.desc;
  return svg(`-2 -8 ${(W + 4).toFixed(1)} ${(H + 12).toFixed(1)}`, body, 'Ápice');
}

const out = (rel, content) => { const p = resolve(root, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, content); };
const L = 'brand/logo';
out(`${L}/apice-isotipo.svg`, isotipo(C.ink, C.gold));
out(`${L}/apice-isotipo-oscuro.svg`, isotipo(C.mist, C.gold));
out(`${L}/apice-isotipo-mono-negro.svg`, isotipo(C.black, C.black));
out(`${L}/apice-isotipo-mono-blanco.svg`, isotipo(C.white, C.white));
out(`${L}/apice-isotipo-app.svg`, isotipo(C.mist, C.gold, C.ink));
out(`${L}/apice-horizontal.svg`, horizontal(C.ink, C.gold));
out(`${L}/apice-horizontal-oscuro.svg`, horizontal(C.mist, C.gold));
out(`${L}/apice-horizontal-mono-negro.svg`, horizontal(C.black, C.black));
out(`${L}/apice-horizontal-mono-blanco.svg`, horizontal(C.white, C.white));
out(`${L}/apice-vertical.svg`, vertical(C.ink, C.gold));
out(`${L}/apice-vertical-oscuro.svg`, vertical(C.mist, C.gold));
out(`${L}/apice-vertical-mono-negro.svg`, vertical(C.black, C.black));
out(`${L}/apice-vertical-mono-blanco.svg`, vertical(C.white, C.white));
out(`${L}/apice-logotipo.svg`, wordmarkOnly(C.ink, C.gold));
out(`${L}/apice-logotipo-oscuro.svg`, wordmarkOnly(C.mist, C.gold));
out(`${L}/apice-animado.svg`, animated(C.ink, C.gold));
out(`${L}/apice-animado-oscuro.svg`, animated(C.mist, C.gold));
// Favicon adaptable a modo claro/oscuro
out('public/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><style>path.k{stroke:${C.ink}}@media (prefers-color-scheme:dark){path.k{stroke:${C.mist}}}</style>${ridges.map((r) => `<path class="k" d="${chevron(r)}" fill="none" stroke-width="${r.w + 1.4}" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}<path d="${diamond(APEX.x, APEX.y, 5.6)}" fill="${C.gold}"/></svg>\n`);
// Datos para los componentes del sitio
out('src/brand/logo-data.json', JSON.stringify({ ridges: ridges.map((r) => ({ d: chevron(r), w: r.w })), apex: diamond(APEX.x, APEX.y, APEX.r), wordmark: wm.d, accent: diamond(wm.acc.cx, wm.acc.cy, wm.acc.r), wmWidth: +wm.width.toFixed(2), asc: wm.asc, desc: wm.desc }, null, 2));
console.log('Logos generados. Ancho del logotipo:', wm.width.toFixed(1), 'x-height:', wm.xh.toFixed(1));
