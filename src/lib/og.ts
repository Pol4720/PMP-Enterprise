/** Imágenes Open Graph (1200×630) generadas en la compilación con Satori + Resvg. */
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import logo from '../brand/logo-data.json';
import { topoPaths } from './topo';

const fontsDir = resolve(process.cwd(), 'node_modules/@fontsource');
const font = (pkg: string, file: string) => readFileSync(resolve(fontsDir, pkg, 'files', file));
const fonts = [
  { name: 'Newsreader', data: font('newsreader', 'newsreader-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
  { name: 'Newsreader', data: font('newsreader', 'newsreader-latin-400-italic.woff'), weight: 400 as const, style: 'italic' as const },
  { name: 'Instrument Sans', data: font('instrument-sans', 'instrument-sans-latin-500-normal.woff'), weight: 500 as const, style: 'normal' as const },
  { name: 'JetBrains Mono', data: font('jetbrains-mono', 'jetbrains-mono-latin-500-normal.woff'), weight: 500 as const, style: 'normal' as const },
];

const b64 = (s: string) => `data:image/svg+xml;base64,${Buffer.from(s).toString('base64')}`;

function isoSvg(stroke: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${logo.ridges.map((r) => `<path d="${r.d}" fill="none" stroke="${stroke}" stroke-width="${r.w}" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}<path d="${logo.apex}" fill="#D9A441"/></svg>`;
}
function topoSvg(seed: string, color: string) {
  const { paths, summit } = topoPaths(seed, { levels: 18, peaks: 3, size: 600 });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">${paths.map((p) => `<path d="${p.d}" fill="none" stroke="${color}" stroke-opacity="${(0.25 + 0.6 * p.level / 18).toFixed(2)}" stroke-width="${p.level % 5 === 0 ? 2 : 1.1}"/>`).join('')}<rect x="${summit.x - 7}" y="${summit.y - 7}" width="14" height="14" fill="#D9A441" transform="rotate(45 ${summit.x} ${summit.y})"/></svg>`;
}

type El = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): El => ({ type, props: { style, children, ...extra } });

export async function renderOg(opts: { eyebrow: string; title: string; subtitle?: string; seed: string; accent?: string }) {
  const accent = opts.accent ?? '#7CC2C8';
  const tree = h('div', { width: 1200, height: 630, display: 'flex', background: '#0F1C26', position: 'relative', fontFamily: 'Instrument Sans', color: '#EEF1F0' }, [
    h('img', { position: 'absolute', right: -60, top: 15, width: 600, height: 600 }, undefined, { src: b64(topoSvg(opts.seed, accent)), width: 600, height: 600 }),
    h('div', { position: 'absolute', left: 0, top: 0, width: 1200, height: 630, display: 'flex', backgroundImage: 'linear-gradient(90deg, #0F1C26 0%, rgba(15,28,38,0.92) 48%, rgba(15,28,38,0) 80%)' }),
    h('div', { position: 'absolute', left: 80, top: 70, display: 'flex', alignItems: 'center', gap: 18 }, [
      h('img', { width: 58, height: 58 }, undefined, { src: b64(isoSvg('#EEF1F0')), width: 58, height: 58 }),
      h('div', { fontFamily: 'Newsreader', fontSize: 44, letterSpacing: -0.5, color: '#EEF1F0' }, 'Ápice'),
    ]),
    h('div', { position: 'absolute', left: 80, top: 210, width: 700, display: 'flex', flexDirection: 'column', gap: 22 }, [
      h('div', { fontFamily: 'JetBrains Mono', fontSize: 20, letterSpacing: 3, textTransform: 'uppercase', color: '#D9A441' }, opts.eyebrow),
      h('div', { fontFamily: 'Newsreader', fontSize: opts.title.length > 34 ? 62 : 76, lineHeight: 1.02, letterSpacing: -1.5, color: '#FFFFFF' }, opts.title),
      opts.subtitle ? h('div', { fontFamily: 'Newsreader', fontStyle: 'italic', fontSize: 32, color: '#f3dca8', lineHeight: 1.2 }, opts.subtitle) : h('div', { display: 'flex' }),
    ]),
    h('div', { position: 'absolute', left: 80, bottom: 56, fontFamily: 'JetBrains Mono', fontSize: 18, letterSpacing: 2, color: '#A9B6BD' }, 'SOFTWARE · DATA SCIENCE · AI'),
  ]);
  const svg = await satori(tree as never, { width: 1200, height: 630, fonts });
  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
}
