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
  const { size = 200, grid = 46, levels = 11, peaks = 3 } = opts;
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
  const key = (x: number, y: number) => `${Math.round(x * 100)},${Math.round(y * 100)}`;
  for (let l = 1; l <= levels; l++) {
    const L = (l / (levels + 1)) * 1.05;
    const segs: [number, number, number, number][] = [];
    for (let j = 0; j < grid; j++) for (let i = 0; i < grid; i++) {
      const a = H[j][i], b = H[j][i + 1], c = H[j + 1][i + 1], e = H[j + 1][i];
      const pts: [number, number][] = [];
      const lp = (p: number, q: number, x0: number, y0: number, x1: number, y1: number): [number, number] => {
        const t = (L - p) / (q - p);
        return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t];
      };
      if ((a < L) !== (b < L)) pts.push(lp(a, b, i, j, i + 1, j));
      if ((b < L) !== (c < L)) pts.push(lp(b, c, i + 1, j, i + 1, j + 1));
      if ((c < L) !== (e < L)) pts.push(lp(c, e, i + 1, j + 1, i, j + 1));
      if ((e < L) !== (a < L)) pts.push(lp(e, a, i, j + 1, i, j));
      for (let m = 0; m + 1 < pts.length; m += 2) segs.push([pts[m][0], pts[m][1], pts[m + 1][0], pts[m + 1][1]]);
    }
    // Encadena segmentos que comparten extremos en polilíneas (SVG mucho más ligero)
    const ends = new Map<string, number[]>();
    segs.forEach((sg, idx) => {
      for (const kk of [key(sg[0], sg[1]), key(sg[2], sg[3])]) { const arr = ends.get(kk); if (arr) arr.push(idx); else ends.set(kk, [idx]); }
    });
    const used = new Uint8Array(segs.length);
    const fmt = (v: number) => (v * k).toFixed(1).replace(/\.0$/, '');
    let d = '';
    const extend = (line: [number, number][], atEnd: boolean) => {
      for (;;) {
        const [x, y] = atEnd ? line[line.length - 1] : line[0];
        const next = (ends.get(key(x, y)) ?? []).find((n) => !used[n]);
        if (next === undefined) return;
        used[next] = 1;
        const sg = segs[next];
        const p: [number, number] = key(sg[0], sg[1]) === key(x, y) ? [sg[2], sg[3]] : [sg[0], sg[1]];
        if (atEnd) line.push(p); else line.unshift(p);
      }
    };
    segs.forEach((sg, idx) => {
      if (used[idx]) return;
      used[idx] = 1;
      const line: [number, number][] = [[sg[0], sg[1]], [sg[2], sg[3]]];
      extend(line, true); extend(line, false);
      // Simplificación: descarta puntos casi alineados
      const simp: [number, number][] = [line[0]];
      for (let q = 1; q < line.length - 1; q++) {
        const [ax, ay] = simp[simp.length - 1], [bx, by] = line[q], [cx, cy] = line[q + 1];
        if (Math.abs((bx - ax) * (cy - ay) - (by - ay) * (cx - ax)) > 0.02) simp.push(line[q]);
      }
      simp.push(line[line.length - 1]);
      d += 'M' + simp.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join(' ');
    });
    if (d) out.push({ d, level: l });
  }
  // Cima: punto más alto
  let best = { x: 0, y: 0, h: -1 };
  for (let j = 0; j <= grid; j++) for (let i = 0; i <= grid; i++) if (H[j][i] > best.h) best = { x: i * k, y: j * k, h: H[j][i] };
  return { paths: out, summit: { x: best.x, y: best.y }, levels };
}
