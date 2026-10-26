// Genera las piezas de marca en public/brand (servidas por el sitio y enlazadas desde /marca/).
// Uso: npm run brand:build && npm run brand:render
// Requiere Playwright con Chromium (npx playwright install chromium si no está instalado).
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync, cpSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deploy } from '../../deploy.config.mjs';

// Playwright se resuelve como dependencia global o local (npm i -D playwright)
const { chromium } = createRequire(import.meta.url)('playwright');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(root, 'public/brand');
const P = (...p) => resolve(OUT, ...p);
mkdirSync(OUT, { recursive: true });
cpSync(resolve(root, 'brand/logo'), P('logo'), { recursive: true });

const logo = JSON.parse(readFileSync(resolve(root, 'src/brand/logo-data.json'), 'utf8'));
const data = JSON.parse(readFileSync(resolve(root, 'brand/datos.json'), 'utf8'));
const pending = (v) => !v || String(v).startsWith('PENDIENTE');
const web = `${deploy.site.replace(/^https?:\/\//, '')}${deploy.base === '/' ? '' : deploy.base}`;
const webUrl = `${deploy.site}${deploy.base === '/' ? '/' : deploy.base + '/'}`;

// Las fuentes se incrustan en base64: las páginas generadas no pueden leer file:// desde about:blank.
const fontUrl = (pkg, file) => `data:font/woff2;base64,${readFileSync(resolve(root, 'node_modules', pkg, 'files', file)).toString('base64')}`;
const FONTS = `
@font-face{font-family:Newsreader;src:url(${fontUrl('@fontsource-variable/newsreader', 'newsreader-latin-opsz-normal.woff2')}) format('woff2');font-weight:200 800;font-style:normal}
@font-face{font-family:Newsreader;src:url(${fontUrl('@fontsource-variable/newsreader', 'newsreader-latin-opsz-italic.woff2')}) format('woff2');font-weight:200 800;font-style:italic}
@font-face{font-family:'Instrument Sans';src:url(${fontUrl('@fontsource-variable/instrument-sans', 'instrument-sans-latin-wght-normal.woff2')}) format('woff2');font-weight:400 700}
@font-face{font-family:'JetBrains Mono';src:url(${fontUrl('@fontsource/jetbrains-mono', 'jetbrains-mono-latin-500-normal.woff2')}) format('woff2');font-weight:500}
*{box-sizing:border-box;margin:0;padding:0}
:root{--night:#0F1C26;--mist:#EEF1F0;--slate:#3B4B57;--rock:#CDD4D3;--glacier:#25707A;--glacierL:#7CC2C8;--gold:#D9A441;--snow:#F8FAF9}
body{font-family:'Instrument Sans',sans-serif;-webkit-font-smoothing:antialiased}
.serif{font-family:Newsreader,serif}.mono{font-family:'JetBrains Mono',monospace}`;

const iso = (stroke, gold = '#D9A441') => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${logo.ridges.map((r) => `<path d="${r.d}" fill="none" stroke="${stroke}" stroke-width="${r.w}" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}<path d="${logo.apex}" fill="${gold}"/></svg>`;
const hlogo = (ink) => readFileSync(resolve(root, `brand/logo/apice-horizontal${ink === 'dark' ? '-oscuro' : ''}.svg`), 'utf8');

// Curvas de nivel decorativas (mismo algoritmo que el sitio, simplificado)
function topo(seed, size = 600, levels = 16, color = '#7CC2C8', opacity = 1) {
  let h = 2166136261; for (const c of seed) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  let a = h >>> 0; const r = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const ps = [0, 1, 2].map((i) => ({ x: i ? 0.15 + r() * 0.7 : 0.45 + r() * 0.1, y: i ? 0.15 + r() * 0.7 : 0.42 + r() * 0.1, a: i ? 0.4 + r() * 0.3 : 1, s: i ? 0.1 + r() * 0.07 : 0.22 }));
  const G = 72, H = [];
  for (let j = 0; j <= G; j++) { H[j] = []; for (let i = 0; i <= G; i++) { const u = i / G, v = j / G; H[j][i] = ps.reduce((m, p) => m + p.a * Math.exp(-((u - p.x) ** 2 + (v - p.y) ** 2) / (2 * p.s * p.s)), 0); } }
  const k = size / G; let out = '';
  for (let l = 1; l <= levels; l++) {
    const L = (l / (levels + 1)) * 1.05; let d = '';
    for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
      const A = H[j][i], B = H[j][i + 1], C = H[j + 1][i + 1], D = H[j + 1][i]; const pts = [];
      const lp = (p, q, x0, y0, x1, y1) => { const t = (L - p) / (q - p); return [(x0 + (x1 - x0) * t) * k, (y0 + (y1 - y0) * t) * k]; };
      if ((A < L) !== (B < L)) pts.push(lp(A, B, i, j, i + 1, j)); if ((B < L) !== (C < L)) pts.push(lp(B, C, i + 1, j, i + 1, j + 1));
      if ((C < L) !== (D < L)) pts.push(lp(C, D, i + 1, j + 1, i, j + 1)); if ((D < L) !== (A < L)) pts.push(lp(D, A, i, j + 1, i, j));
      for (let m = 0; m + 1 < pts.length; m += 2) d += `M${pts[m][0].toFixed(1)} ${pts[m][1].toFixed(1)}L${pts[m + 1][0].toFixed(1)} ${pts[m + 1][1].toFixed(1)}`;
    }
    out += `<path d="${d}" fill="none" stroke="${color}" stroke-opacity="${((0.2 + 0.8 * l / levels) * opacity).toFixed(2)}" stroke-width="${l % 5 === 0 ? 1.6 : 0.9}" vector-effect="non-scaling-stroke"/>`;
  }
  return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">${out}</svg>`;
}
const page = (body, css = '') => `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${FONTS}${css}</style></head><body>${body}</body></html>`;

// ── Tarjetas de presentación (85 × 55 mm + 3 mm de sangrado) ─────────────────
const person = !pending(data.tarjeta?.nombre);
const email = pending(data.correo) ? '' : data.correo;
const cardCss = `
@page{size:91mm 61mm;margin:0}
.card{width:91mm;height:61mm;position:relative;overflow:hidden;page-break-after:always}
.safe{position:absolute;inset:7mm}
.front{background:var(--night);color:var(--mist)}
.front .topo{position:absolute;right:-22mm;top:-14mm;width:80mm;height:80mm;opacity:.55}
.front .logo{position:absolute;left:7mm;bottom:8mm;width:38mm}
.front .tag{position:absolute;left:7mm;top:7mm;font:500 5.4pt/1 'JetBrains Mono';letter-spacing:.14em;text-transform:uppercase;color:var(--gold)}
.back{background:var(--mist);color:var(--night)}
.back .iso{position:absolute;right:7mm;top:7mm;width:9mm}
.back .slogan{position:absolute;left:7mm;top:7mm;font:400 11.5pt/1.12 Newsreader;width:44mm}
.back .slogan i{color:#8A5E12}
.back .person{position:absolute;left:7mm;top:24mm}
.back .person b{display:block;font:500 9pt/1.2 'Instrument Sans'}
.back .person span{font:400 6.5pt/1.3 'Instrument Sans';color:var(--slate)}
.back .info{position:absolute;left:7mm;bottom:7mm;font:500 6pt/1.7 'JetBrains Mono';color:var(--slate)}
.back .info b{color:var(--night);font-weight:500}
.back .rule{position:absolute;left:7mm;right:7mm;bottom:17mm;height:.25mm;background:var(--rock)}
.back .dot{position:absolute;right:7mm;bottom:7.6mm;width:2mm;height:2mm;background:var(--gold);transform:rotate(45deg)}`;
const cardFront = `<section class="card front"><div class="topo">${topo('apice-tarjeta', 600, 18, '#7CC2C8')}</div><p class="tag">Software · Datos · IA</p><div class="logo">${hlogo('dark')}</div></section>`;
const cardBack = `<section class="card back"><div class="iso">${iso('#0F1C26')}</div><p class="slogan">Rigor científico.<br><i>Software de altura.</i></p>
${person ? `<div class="person"><b>${data.tarjeta.nombre}</b><span>${data.tarjeta.cargo ?? ''}</span></div>` : ''}
<div class="rule"></div><p class="info">${email ? `<b>${email}</b><br>` : ''}${web}</p><span class="dot"></span></section>`;

// ── Firma de correo (HTML con tablas y estilos en línea) ─────────────────────
const signature = `<!-- Firma de correo de Ápice. Copia el contenido de la tabla en la configuración de firma de tu cliente de correo. -->
<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;color:#0F1C26;border-collapse:collapse">
  <tr>
    <td style="padding:0 18px 0 0;border-right:1px solid #CDD4D3;vertical-align:top">
      <img src="${webUrl}brand/png/apice-isotipo-128.png" width="48" height="48" alt="Ápice" style="display:block;border:0">
    </td>
    <td style="padding:0 0 0 18px;vertical-align:top">
      ${person ? `<p style="margin:0;font-size:15px;font-weight:bold;color:#0F1C26">${data.tarjeta.nombre}</p><p style="margin:2px 0 8px;font-size:12px;color:#3B4B57">${data.tarjeta.cargo ?? ''} · Ápice</p>` : `<p style="margin:0 0 8px;font-family:Georgia,serif;font-size:17px;color:#0F1C26">Ápice</p>`}
      <p style="margin:0;font-size:12px;line-height:18px;color:#3B4B57">Rigor científico. Software de altura.</p>
      <p style="margin:6px 0 0;font-size:12px;line-height:18px">${email ? `<a href="mailto:${email}" style="color:#25707A;text-decoration:none">${email}</a> · ` : ''}<a href="${webUrl}" style="color:#25707A;text-decoration:none">${web}</a></p>
    </td>
  </tr>
</table>
`;

// ── Presentación (16:9) ───────────────────────────────────────────────────────
const slideCss = `@page{size:1920px 1080px;margin:0}
.s{width:1920px;height:1080px;position:relative;overflow:hidden;page-break-after:always;padding:120px 140px}
.dark{background:var(--night);color:var(--mist)}.light{background:var(--mist);color:var(--night)}
.s .lg{position:absolute;left:140px;top:90px;width:220px}.s .num{position:absolute;right:140px;bottom:80px;font:500 22px 'JetBrains Mono';color:#7a8b95}
.eb{font:500 24px 'JetBrains Mono';letter-spacing:.14em;text-transform:uppercase;color:var(--gold);display:flex;gap:16px;align-items:center}
.eb:before{content:"";width:14px;height:14px;background:var(--gold);transform:rotate(45deg)}
h1{font:350 150px/0.98 Newsreader;letter-spacing:-.025em}h1 i{color:#f3dca8}
h2{font:380 96px/1.02 Newsreader;letter-spacing:-.02em}
p.l{font:400 34px/1.5 'Instrument Sans';color:#5b6b76;max-width:1100px}.dark p.l{color:#C9D3D6}
.topo{position:absolute;right:-200px;top:-80px;width:1300px;height:1300px;opacity:.6}
ul{list-style:none;display:grid;gap:34px;margin-top:70px}li{font:400 36px/1.4 'Instrument Sans';padding-left:46px;position:relative}
li:before{content:"";position:absolute;left:0;top:18px;width:14px;height:14px;border:2px solid var(--glacier);transform:rotate(45deg)}
.kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:60px;margin-top:100px}.kpi{border-top:2px solid var(--night);padding-top:36px}
.kpi b{display:block;font:500 120px/1 'JetBrains Mono';letter-spacing:-.04em}.kpi span{font:400 30px/1.4 'Instrument Sans';color:#5b6b76}`;
const slides = [
  `<section class="s dark"><div class="topo">${topo('apice-deck', 900, 22)}</div><div class="lg">${hlogo('dark')}</div>
   <div style="position:absolute;left:140px;bottom:160px"><p class="eb">Título de la presentación</p><h1 style="margin-top:40px">Rigor científico.<br><i>Software de altura.</i></h1></div><p class="num">01</p></section>`,
  `<section class="s light"><div class="lg">${hlogo('light')}</div><div style="position:absolute;left:140px;top:380px"><p class="eb">Sección 02</p><h2 style="margin-top:36px;max-width:1300px">Título de sección: una idea por diapositiva.</h2></div><p class="num">02</p></section>`,
  `<section class="s light"><p class="eb">Contenido</p><h2 style="margin-top:36px;max-width:1400px">Usa frases cortas y verbos concretos.</h2>
   <ul><li>Máximo cinco puntos por diapositiva.</li><li>Datos con su fuente y su fecha.</li><li>Un único color de acento por gráfico.</li></ul><p class="num">03</p></section>`,
  `<section class="s light"><p class="eb">Resultados</p><h2 style="margin-top:36px">Cifras clave</h2>
   <div class="kpis"><div class="kpi"><b>3×</b><span>Ejemplo de mejora medida respecto a la línea base.</span></div><div class="kpi"><b>94 %</b><span>Ejemplo de precisión validada con datos nuevos.</span></div><div class="kpi"><b>−40 %</b><span>Ejemplo de reducción de tiempo de proceso.</span></div></div><p class="num">04</p></section>`,
  `<section class="s dark"><div class="topo">${topo('apice-cierre', 900, 22, '#D9A441', .6)}</div><div style="position:absolute;left:140px;top:300px"><div style="width:120px">${iso('#EEF1F0')}</div><h2 style="margin-top:60px">Gracias.</h2><p class="l" style="margin-top:30px">${email ? email + ' · ' : ''}${web}</p></div><p class="num">05</p></section>`,
];

// ── Documento A4 con membrete ─────────────────────────────────────────────────
const docCss = `@page{size:A4;margin:0}
.a4{width:210mm;height:297mm;position:relative;background:#fff;color:var(--night);padding:46mm 22mm 30mm;page-break-after:always}
.hd{position:absolute;left:22mm;right:22mm;top:16mm;display:flex;justify-content:space-between;align-items:center;border-bottom:.3mm solid var(--rock);padding-bottom:6mm}
.hd .lg{width:34mm}.hd p{font:500 7pt 'JetBrains Mono';letter-spacing:.12em;text-transform:uppercase;color:var(--slate)}
.ft{position:absolute;left:22mm;right:22mm;bottom:14mm;display:flex;justify-content:space-between;font:500 7pt 'JetBrains Mono';color:var(--slate)}
.ft:before{content:"";position:absolute;left:0;right:0;top:-5mm;height:.3mm;background:var(--rock)}
.eb{font:500 8pt 'JetBrains Mono';letter-spacing:.14em;text-transform:uppercase;color:#8A5E12}
h1{font:380 30pt/1.05 Newsreader;margin:4mm 0 8mm;letter-spacing:-.01em}
h2{font:500 14pt/1.2 Newsreader;margin:9mm 0 3mm}
p{font:400 10pt/1.6 'Instrument Sans';color:#2b3a45;max-width:150mm}
p.g{color:#6c7a83;font-style:italic}`;
const doc = `<section class="a4"><div class="hd"><div class="lg">${hlogo('light')}</div><p>Documento · Confidencial</p></div>
<p class="eb">Propuesta de servicios</p><h1>Título del documento</h1>
<h2>1. Contexto</h2><p class="g">Describe la situación del cliente y el problema de negocio en dos o tres frases.</p>
<h2>2. Objetivo</h2><p class="g">Qué decisión o resultado medible debe permitir el proyecto.</p>
<h2>3. Enfoque</h2><p class="g">Diagnóstico, datos, modelado, validación y despliegue: qué incluye cada fase y su entregable.</p>
<h2>4. Plazos y entregables</h2><p class="g">Calendario por fases con fechas y entregables verificables.</p>
<h2>5. Condiciones</h2><p class="g">Alcance, supuestos, confidencialidad y tratamiento de datos.</p>
<div class="ft"><span>Ápice · ${web}</span><span>Página 1</span></div></section>`;

// ── Redes sociales ────────────────────────────────────────────────────────────
const social = [
  { name: 'post-cuadrado-1080', w: 1080, h: 1080, html: `<div class="sc dark"><div class="topo">${topo('apice-post', 900, 20)}</div><div class="lg">${hlogo('dark')}</div><h1>Rigor científico.<br><i>Software de altura.</i></h1></div>` },
  { name: 'post-vertical-1080x1350', w: 1080, h: 1350, html: `<div class="sc light"><div class="topo">${topo('apice-servicios', 900, 20, '#25707A', .7)}</div><div class="lg">${hlogo('light')}</div><p class="eb">Servicios de datos e IA</p><h1 style="color:#0F1C26">Ciencia de datos a la medida de tu problema.</h1></div>` },
  { name: 'historia-1080x1920', w: 1080, h: 1920, html: `<div class="sc dark"><div class="topo">${topo('apice-historia', 900, 22)}</div><div class="lg">${hlogo('dark')}</div><p class="eb">Próximamente</p><h1>Muévelo<br><i>La forma más directa de mover mercancía.</i></h1></div>` },
  { name: 'banner-linkedin-1584x396', w: 1584, h: 396, html: `<div class="sc dark bn"><div class="topo">${topo('apice-linkedin', 900, 20)}</div><h1>Rigor científico. <i>Software de altura.</i></h1></div>` },
  { name: 'cabecera-x-1500x500', w: 1500, h: 500, html: `<div class="sc dark bn"><div class="topo">${topo('apice-x', 900, 20)}</div><h1>Rigor científico. <i>Software de altura.</i></h1></div>` },
];
const socialCss = (w, h) => `html,body{width:${w}px;height:${h}px}.sc{width:${w}px;height:${h}px;position:relative;overflow:hidden;padding:${Math.round(w * 0.08)}px;display:flex;flex-direction:column;justify-content:flex-end;gap:${Math.round(w * 0.03)}px}
.dark{background:var(--night);color:var(--mist)}.light{background:var(--mist);color:var(--night)}
.topo{position:absolute;right:-${Math.round(w * 0.25)}px;top:-${Math.round(h * 0.05)}px;width:${Math.round(Math.max(w, h) * 1.05)}px;height:${Math.round(Math.max(w, h) * 1.05)}px}
.lg{position:absolute;left:${Math.round(w * 0.08)}px;top:${Math.round(w * 0.08)}px;width:${Math.round(w * 0.26)}px}
h1{position:relative;font:350 ${Math.round(w * 0.085)}px/1 Newsreader;letter-spacing:-.02em}h1 i{color:#f3dca8}.light h1 i{color:#8A5E12}
.eb{position:relative;font:500 ${Math.round(w * 0.022)}px 'JetBrains Mono';letter-spacing:.14em;text-transform:uppercase;color:var(--gold)}
.bn{justify-content:center}.bn h1{font-size:${Math.round(h * 0.16)}px;margin-left:${Math.round(w * 0.27)}px;white-space:nowrap}.bn .topo{left:-${Math.round(w * 0.1)}px;right:auto}`;

// ── Render ───────────────────────────────────────────────────────────────────
const browser = await chromium.launch();
const ctx = await browser.newContext({ deviceScaleFactor: 1 });
const pg = await ctx.newPage();
const shot = async (html, w, h, file, scale = 1) => {
  await pg.setViewportSize({ width: w, height: h });
  await pg.setContent(html, { waitUntil: 'load' }); await pg.evaluate(() => document.fonts.ready);
  mkdirSync(dirname(file), { recursive: true });
  await pg.screenshot({ path: file, omitBackground: true, scale: scale === 1 ? 'css' : 'device' });
};
const pdf = async (html, file, opts) => {
  await pg.setContent(html, { waitUntil: 'load' }); await pg.evaluate(() => document.fonts.ready);
  mkdirSync(dirname(file), { recursive: true });
  await pg.pdf({ path: file, printBackground: true, preferCSSPageSize: true, ...opts });
};

// Logos PNG
const pngLogo = async (svgFile, w, out, bg = 'transparent') => {
  const svg = readFileSync(resolve(root, 'brand/logo', svgFile), 'utf8');
  const vb = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
  const h = Math.round((w * vb[3]) / vb[2]);
  await shot(page(`<div style="width:${w}px;height:${h}px;background:${bg}">${svg.replace('<svg ', `<svg width="${w}" height="${h}" `)}</div>`, 'html,body{background:transparent}'), w, h, out);
};
mkdirSync(P('png'), { recursive: true });
for (const [svg, name] of [['apice-horizontal.svg', 'apice-horizontal'], ['apice-horizontal-oscuro.svg', 'apice-horizontal-oscuro'], ['apice-vertical.svg', 'apice-vertical'], ['apice-vertical-oscuro.svg', 'apice-vertical-oscuro']]) {
  await pngLogo(svg, 1200, P('png', `${name}-1200.png`));
}
for (const s of [128, 512, 1024]) await pngLogo('apice-isotipo.svg', s, P('png', `apice-isotipo-${s}.png`));
await pngLogo('apice-isotipo-app.svg', 1024, P('png', 'apice-isotipo-app-1024.png'));
await pngLogo('apice-isotipo-app.svg', 512, P('apice-isotipo-app.png'));

// Favicons e iconos de app
const appIcon = (size, pad) => page(`<div style="width:${size}px;height:${size}px;background:#0F1C26;display:grid;place-items:center"><div style="width:${size - pad * 2}px">${iso('#EEF1F0')}</div></div>`);
await shot(appIcon(32, 2), 32, 32, resolve(root, 'public/favicon-32.png'));
await shot(appIcon(180, 30), 180, 180, resolve(root, 'public/apple-touch-icon.png'));
await shot(appIcon(192, 30), 192, 192, resolve(root, 'public/icon-192.png'));
await shot(appIcon(512, 80), 512, 512, resolve(root, 'public/icon-512.png'));
await shot(appIcon(512, 130), 512, 512, resolve(root, 'public/icon-maskable-512.png'));

// Tarjetas
await pdf(page(cardFront + cardBack, cardCss), P('tarjetas', 'tarjeta-apice-imprenta.pdf'), {});
writeFileSync(P('tarjetas', 'tarjeta-apice.html'), page(cardFront + cardBack, cardCss + 'body{display:grid;gap:10mm;padding:10mm;background:#ccc}.card{page-break-after:auto}'));
const cardDigital = (inner) => page(`<div style="width:85mm;height:55mm;overflow:hidden;position:relative"><div style="position:absolute;left:-3mm;top:-3mm">${inner}</div></div>`, cardCss);
await shot(cardDigital(cardFront), 322, 208, P('tarjetas', 'tarjeta-frente.png'), 4);
await pg.setViewportSize({ width: 322, height: 208 });
await pg.setContent(cardDigital(cardFront)); await pg.evaluate(() => document.fonts.ready);
await ctx.close();
const ctx2 = await browser.newContext({ deviceScaleFactor: 4 });
const pg2 = await ctx2.newPage();
for (const [inner, name] of [[cardFront, 'frente'], [cardBack, 'dorso']]) {
  await pg2.setViewportSize({ width: 322, height: 208 });
  await pg2.setContent(cardDigital(inner)); await pg2.evaluate(() => document.fonts.ready);
  await pg2.screenshot({ path: P('tarjetas', `tarjeta-${name}.png`) });
}
await ctx2.close();
const ctx3 = await browser.newContext({ deviceScaleFactor: 1 });
const pg3 = await ctx3.newPage();
const shot3 = async (html, w, h, file) => { await pg3.setViewportSize({ width: w, height: h }); await pg3.setContent(html, { waitUntil: 'load' }); await pg3.evaluate(() => document.fonts.ready); mkdirSync(dirname(file), { recursive: true }); await pg3.screenshot({ path: file }); };
const pdf3 = async (html, file) => { await pg3.setContent(html, { waitUntil: 'load' }); await pg3.evaluate(() => document.fonts.ready); mkdirSync(dirname(file), { recursive: true }); await pg3.pdf({ path: file, printBackground: true, preferCSSPageSize: true }); };

// Firma
mkdirSync(P('email'), { recursive: true });
writeFileSync(P('email', 'firma-apice.html'), `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Firma de correo · Ápice</title></head><body style="margin:24px">${signature}</body></html>`);
const isoPng = `data:image/png;base64,${readFileSync(P('png', 'apice-isotipo-128.png')).toString('base64')}`;
await shot3(`<!doctype html><html><body style="margin:24px;background:#fff">${signature.replace(`${webUrl}brand/png/apice-isotipo-128.png`, isoPng)}</body></html>`, 560, 140, P('email', 'firma-apice.png'));

// Presentación, documento y redes
mkdirSync(P('plantillas'), { recursive: true });
const deck = page(slides.join(''), slideCss);
writeFileSync(P('plantillas', 'presentacion-apice.html'), deck);
await pdf3(deck, P('plantillas', 'presentacion-apice.pdf'));
for (const [i, s] of slides.entries()) await shot3(page(s, slideCss), 1920, 1080, P('plantillas', `diapositiva-${i + 1}.png`));
const docHtml = page(doc, docCss);
writeFileSync(P('plantillas', 'documento-apice.html'), docHtml);
await pdf3(docHtml, P('plantillas', 'documento-apice.pdf'));
await shot3(page(doc, docCss), 794, 1123, P('plantillas', 'documento-apice.png'));
for (const s of social) await shot3(page(s.html, socialCss(s.w, s.h)), s.w, s.h, P('redes', `${s.name}.png`));

await browser.close();
console.log('Piezas de marca generadas en public/brand');
