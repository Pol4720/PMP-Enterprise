/**
 * Calcula fuera del hilo principal todos los datos de la escena:
 * alturas de partículas y malla, posiciones de «caos», cima y ruta de ascenso.
 * Así la página sigue respondiendo mientras se prepara el terreno.
 */
import { buildPeaks, makeHeight, gradientAscent, rng, APEX, type Peak } from './terrain';

export type TerrainRequest = {
  products: { name: string; accent: string; status: string }[];
  soonLabel: string;
  side: number; // partículas por lado
  seg: number; // segmentos de la malla por lado
  world: { x: number; y: number; z: number };
};

export type TerrainData = {
  peaks: Peak[];
  summit: { u: number; v: number; h: number };
  side: number;
  grid: Float32Array;
  hs: Float32Array;
  chaos: Float32Array;
  rand: Float32Array;
  seg: number;
  meshH: Float32Array;
  path: Float32Array; // u, v, h por paso
};

export function computeTerrain(req: TerrainRequest): TerrainData {
  const { side, seg } = req;
  const peaks = buildPeaks(req.products, req.soonLabel);
  const h0 = makeHeight(peaks);
  let best = { u: APEX.u, v: APEX.v, h: 0 };
  for (let i = -20; i <= 20; i++) for (let j = -20; j <= 20; j++) {
    const u = APEX.u + i * 0.003, v = APEX.v + j * 0.003, hv = h0(u, v);
    if (hv > best.h) best = { u, v, h: hv };
  }
  peaks[0].u = best.u; peaks[0].v = best.v;
  const h = makeHeight(peaks);
  best.h = h(best.u, best.v);

  const N = side * side;
  const grid = new Float32Array(N * 2), hs = new Float32Array(N), chaos = new Float32Array(N * 3), rand = new Float32Array(N);
  const r = rng(7);
  // Siete «fuentes» de datos heterogéneas: nubes, filamentos y anillos
  const sources = Array.from({ length: 7 }, (_, i) => ({ c: [2 + r() * 16, 1.5 + r() * 9, (r() - 0.5) * 14 - 2], s: 0.8 + r() * 2.2, type: i % 3 }));
  const gauss = () => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  for (let j = 0, k = 0; j < side; j++) for (let i = 0; i < side; i++, k++) {
    const u = (i + 0.5) / side, v = (j + 0.5) / side;
    grid[k * 2] = u; grid[k * 2 + 1] = v;
    hs[k] = h(u, v);
    rand[k] = r();
    let x: number, y: number, z: number;
    if (r() < 0.28) { x = (r() - 0.5) * 40; y = r() * 16 - 2; z = (r() - 0.5) * 34; }
    else {
      const s = sources[Math.floor(r() * sources.length)];
      if (s.type === 0) { x = gauss() * s.s; y = gauss() * 0.7 * s.s; z = gauss() * s.s; }
      else if (s.type === 1) { const t = (r() - 0.5) * 12; x = t; y = Math.sin(t * 0.8) * 1.2 + gauss() * 0.2; z = gauss() * 0.3; }
      else { const a = r() * Math.PI * 2, rr = s.s * 1.6 + gauss() * 0.15; x = Math.cos(a) * rr; y = gauss() * 0.15; z = Math.sin(a) * rr; }
      x += s.c[0]; y += s.c[1]; z += s.c[2];
    }
    chaos[k * 3] = x; chaos[k * 3 + 1] = y; chaos[k * 3 + 2] = z;
  }

  // Alturas de la malla en el mismo orden que PlaneGeometry rotada a XZ
  const meshH = new Float32Array((seg + 1) * (seg + 1));
  for (let iy = 0, k = 0; iy <= seg; iy++) for (let ix = 0; ix <= seg; ix++, k++) {
    // PlaneGeometry: y va de +H/2 a -H/2; tras rotateX(-90°) z = -y → v crece con iy
    meshH[k] = h(ix / seg, iy / seg);
  }

  const pts = gradientAscent(h, { u: 0.16, v: 0.95 });
  pts.push({ u: best.u, v: best.v, h: best.h });
  const path = new Float32Array(pts.length * 3);
  pts.forEach((p, i) => { path[i * 3] = p.u; path[i * 3 + 1] = p.v; path[i * 3 + 2] = p.h; });

  return { peaks, summit: best, side, grid, hs, chaos, rand, seg, meshH, path };
}

type WorkerScope = { onmessage: ((e: MessageEvent<TerrainRequest>) => void) | null; postMessage: (d: unknown, t: Transferable[]) => void };
const ctx = self as unknown as WorkerScope;
// Solo dentro de un worker (la alternativa en el hilo principal importa computeTerrain sin escuchar mensajes)
if (typeof window === 'undefined') ctx.onmessage = (e: MessageEvent<TerrainRequest>) => {
  const d = computeTerrain(e.data);
  ctx.postMessage(d, [d.grid.buffer, d.hs.buffer, d.chaos.buffer, d.rand.buffer, d.meshH.buffer, d.path.buffer]);
};
