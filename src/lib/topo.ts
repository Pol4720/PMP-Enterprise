/**
 * Emblemas topográficos deterministas: a partir de una semilla (p. ej. el slug de un producto)
 * genera curvas de nivel en SVG. Cada producto o servicio tiene así un «mapa» propio sin dibujarlo a mano.
 */
function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type TopoOptions = { size?: number; grid?: number; levels?: number; peaks?: number };

/** Devuelve una lista de trazos (uno por nivel) en un viewBox size×size. */
export function topoPaths(seed: string, opts: TopoOptions = {}) {
  const { size = 200, grid = 64, levels = 11, peaks = 3 } = opts;
  const r = rng(hashString(seed));
  const ps = Array.from({ length: peaks }, (_, i) => ({
    x: i === 0 ? 0.42 + r() * 0.16 : 0.15 + r() * 0.7,
    y: i === 0 ? 0.4 + r() * 0.16 : 0.15 + r() * 0.7,
    a: i === 0 ? 1 : 0.35 + r() * 0.4,
    s: i === 0 ? 0.2 + r() * 0.06 : 0.1 + r() * 0.08,
    sx: 0.8 + r() * 0.5,
  }));
  const ph = r() * 10;
  const H: number[][] = [];
  for (let j = 0; j <= grid; j++) {
    H[j] = [];
    for (let i = 0; i <= grid; i++) {
      const u = i / grid, v = j / grid;
      let h = 0;
      for (const p of ps) {
        const dx = (u - p.x) * p.sx, dy = v - p.y;
        h += p.a * Math.exp(-(dx * dx + dy * dy) / (2 * p.s * p.s));
      }
      h += 0.04 * Math.sin(u * 9 + ph) * Math.cos(v * 7 - ph);
      H[j][i] = h;
    }
  }
  const out: { d: string; level: number }[] = [];
  const k = size / grid;
  for (let l = 1; l <= levels; l++) {
    const L = (l / (levels + 1)) * 1.05;
    let d = '';
    for (let j = 0; j < grid; j++) for (let i = 0; i < grid; i++) {
      const a = H[j][i], b = H[j][i + 1], c = H[j + 1][i + 1], e = H[j + 1][i];
      const pts: [number, number][] = [];
      const lp = (p: number, q: number, x0: number, y0: number, x1: number, y1: number): [number, number] => {
        const t = (L - p) / (q - p);
        return [(x0 + (x1 - x0) * t) * k, (y0 + (y1 - y0) * t) * k];
      };
      if ((a < L) !== (b < L)) pts.push(lp(a, b, i, j, i + 1, j));
      if ((b < L) !== (c < L)) pts.push(lp(b, c, i + 1, j, i + 1, j + 1));
      if ((c < L) !== (e < L)) pts.push(lp(c, e, i + 1, j + 1, i, j + 1));
      if ((e < L) !== (a < L)) pts.push(lp(e, a, i, j + 1, i, j));
      for (let m = 0; m + 1 < pts.length; m += 2) {
        d += `M${pts[m][0].toFixed(1)} ${pts[m][1].toFixed(1)}L${pts[m + 1][0].toFixed(1)} ${pts[m + 1][1].toFixed(1)}`;
      }
    }
    if (d) out.push({ d, level: l });
  }
  // Cima: punto más alto
  let best = { x: 0, y: 0, h: -1 };
  for (let j = 0; j <= grid; j++) for (let i = 0; i <= grid; i++) if (H[j][i] > best.h) best = { x: i * k, y: j * k, h: H[j][i] };
  return { paths: out, summit: { x: best.x, y: best.y }, levels };
}
