/** Calidad según el dispositivo: cuántas partículas y cuánta resolución de malla. */
export type Quality = 'high' | 'medium' | 'low';
export function pickQuality(): { quality: Quality; side: number; seg: number } {
  const mobile = matchMedia('(max-width: 760px)').matches || matchMedia('(pointer: coarse)').matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  const quality: Quality = mobile ? (cores >= 6 ? 'medium' : 'low') : cores >= 6 ? 'high' : 'medium';
  const side = quality === 'high' ? 330 : quality === 'medium' ? 210 : 150;
  const seg = quality === 'high' ? 260 : quality === 'medium' ? 180 : 130;
  return { quality, side, seg };
}
