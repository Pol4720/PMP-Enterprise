/** Scroll suave (Lenis) sincronizado con GSAP ScrollTrigger. Solo en escritorio y con movimiento permitido. */
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

export function motionAllowed() {
  return !matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function initSmoothScroll() {
  if (lenis || !motionAllowed()) return lenis;
  const fine = matchMedia('(pointer: fine)').matches;
  if (!fine) return null; // en táctil, el scroll nativo es el más fluido
  lenis = new Lenis({ lerp: 0.09, anchors: { offset: -72 }, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export { gsap, ScrollTrigger };
