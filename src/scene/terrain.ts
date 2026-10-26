/**
 * Terreno procedural de la historia.
 * Una función de altura determinista h(u, v) ∈ [0, ~1] sobre el cuadrado unidad:
 * la cima de Ápice en el centro y una cumbre por cada producto del catálogo.
 * Añadir un producto en products.config.ts añade una montaña aquí.
 */

export type Peak = { u: number; v: number; amp: number; sigma: number; kind: 'apex' | 'product' | 'future'; label?: string; accent?: string; status?: string };

/** Generador pseudoaleatorio reproducible (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Ruido de valor 2D suave con tabla de permutación fija.
const R = rng(2410);
const SIZE = 256;
const grid = new Float32Array(SIZE * SIZE).map(() => R());
const fade = (t: number) => t * t * (3 - 2 * t);
function vnoise(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const g = (i: number, j: number) => grid[((j & 255) * SIZE + (i & 255))];
  const a = g(xi, yi), b = g(xi + 1, yi), c = g(xi, yi + 1), d = g(xi + 1, yi + 1);
  const u = fade(xf), v = fade(yf);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function ridged(x: number, y: number) {
  let sum = 0, amp = 0.5, freq = 1, prev = 1;
  for (let o = 0; o < 5; o++) {
    let n = 1 - Math.abs(vnoise(x * freq, y * freq) * 2 - 1);
    n *= n;
    sum += n * amp * prev;
    prev = n;
    freq *= 2.03; amp *= 0.5;
  }
  return sum;
}

export const APEX = { u: 0.5, v: 0.44 };

/** Coloca las cumbres: la cima, una por producto y dos cumbres futuras sin nombre. */
export function buildPeaks(products: { name: string; accent: string; status: string }[], soonLabel: string): Peak[] {
  const peaks: Peak[] = [{ ...APEX, amp: 1, sigma: 0.15, kind: 'apex', label: 'Ápice' }];
  // Posiciones alrededor de la cima, en orden de aparición: primero las más visibles desde la cámara final.
  const slots = [
    { u: 0.22, v: 0.62 }, { u: 0.8, v: 0.6 }, { u: 0.3, v: 0.24 }, { u: 0.72, v: 0.22 },
    { u: 0.14, v: 0.4 }, { u: 0.88, v: 0.38 }, { u: 0.5, v: 0.8 }, { u: 0.6, v: 0.12 },
  ];
  products.slice(0, slots.length - 2).forEach((p, i) => {
    peaks.push({ ...slots[i], amp: 0.6 - i * 0.03, sigma: 0.095, kind: 'product', label: p.name, accent: p.accent, status: p.status });
  });
  const used = peaks.length - 1;
  for (let k = 0; k < 2; k++) {
    const s = slots[used + k];
    if (s) peaks.push({ ...s, amp: 0.46 - k * 0.06, sigma: 0.085, kind: 'future', label: soonLabel });
  }
  return peaks;
}

export function makeHeight(peaks: Peak[]) {
  return (u: number, v: number) => {
    let m = 0;
    for (const p of peaks) {
      const d = Math.hypot(u - p.u, v - p.v) / p.sigma;
      // Pico algo más afilado que una campana gaussiana
      m = Math.max(m, p.amp * Math.exp(-Math.pow(d, 1.6) * 0.62));
      m += p.amp * 0.08 * Math.exp(-d * d * 0.25);
    }
    // Detalle de roca: crestas que crecen con la altitud
    const detail = ridged(u * 7 + 3.1, v * 7 + 1.7);
    const base = 0.05 * vnoise(u * 3, v * 3);
    let h = m * (0.86 + 0.24 * detail) + base;
    // Bordes que se pierden en la niebla
    const edge = Math.min(u, 1 - u, v, 1 - v);
    h *= Math.min(1, edge / 0.12) ** 0.8;
    return Math.max(0, h);
  };
}

/** Ascenso por gradiente desde la base hasta la cima: la ruta de la historia. */
export function gradientAscent(h: (u: number, v: number) => number, start = { u: 0.16, v: 0.94 }) {
  const pts: { u: number; v: number; h: number }[] = [];
  let { u, v } = start;
  const e = 1e-3;
  const target = APEX;
  for (let i = 0; i < 2000; i++) {
    const hv = h(u, v);
    pts.push({ u, v, h: hv });
    const gu = (h(u + e, v) - h(u - e, v)) / (2 * e);
    const gv = (h(u, v + e) - h(u, v - e)) / (2 * e);
    // Gradiente con una pequeña atracción hacia la cima para evitar óptimos locales
    const tu = target.u - u, tv = target.v - v;
    const dist = Math.hypot(tu, tv);
    if (dist < 0.006) break;
    let du = gu + 2.2 * tu / (dist + 1e-6), dv = gv + 2.2 * tv / (dist + 1e-6);
    const n = Math.hypot(du, dv) || 1;
    du /= n; dv /= n;
    const step = 0.0045;
    u += du * step; v += dv * step;
  }
  pts.push({ u: target.u, v: target.v, h: h(target.u, target.v) });
  return pts;
}
