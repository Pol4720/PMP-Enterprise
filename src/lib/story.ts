/**
 * Controlador de la historia: conecta el scroll con la escena 3D y los textos.
 * La escena (Three.js) se carga en diferido para que la portada pinte al instante.
 */
import { PHASES, type PhaseId } from '../scene/phases';
import { initSmoothScroll, gsap, ScrollTrigger } from './smooth';
import type { StoryScene, StoryProduct } from '../scene/StoryScene';

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };

function webglOk() {
  try {
    const c = document.createElement('canvas');
    return !!c.getContext('webgl2');
  } catch { return false; }
}

export function initStory() {
  const root = document.querySelector<HTMLElement>('[data-story]');
  if (!root) return;
  const motion = document.documentElement.classList.contains('js-motion');
  initSmoothScroll();
  if (!motion || !webglOk()) return; // se queda la versión estática

  root.classList.add('is-3d');
  const lang = root.dataset.lang ?? 'es';
  const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'es' ? '\u202f' : ',');
  const products: StoryProduct[] = JSON.parse(root.dataset.products ?? '[]');
  const canvas = root.querySelector<HTMLCanvasElement>('[data-canvas]')!;
  const hero = root.querySelector<HTMLElement>('[data-hero]')!;
  const hint = root.querySelector<HTMLElement>('[data-hint]')!;
  const outro = root.querySelector<HTMLElement>('[data-outro]')!;
  const chapters = [...root.querySelectorAll<HTMLElement>('[data-chapter]')];
  const altFill = root.querySelector<HTMLElement>('[data-alt-fill]')!;
  const altMark = root.querySelector<HTMLElement>('[data-alt-mark]')!;
  const altVal = root.querySelector<HTMLElement>('[data-alt-val]')!;
  const altTop = root.querySelector<HTMLElement>('[data-alt-top]')!;
  const altSteps = [...root.querySelectorAll<HTMLElement>('[data-alt-step]')];
  const labelsBox = root.querySelector<HTMLElement>('[data-labels]')!;

  let target = 0;
  let progress = 0;
  let scene: StoryScene | null = null;
  let visible = true;
  let altitude = 0;
  let readout: HTMLElement | null = null;
  const t0 = performance.now();

  ScrollTrigger.create({
    trigger: root, start: 'top top', end: 'bottom bottom',
    onUpdate: (st) => { target = st.progress; },
    onRefresh: (st) => { target = st.progress; },
  });

  const ids = chapters.map((c) => c.dataset.chapter as PhaseId);
  let active = -1;
  const countUp = (el: HTMLElement) => {
    const raw = el.textContent ?? '';
    const digits = raw.replace(/[^\d]/g, '');
    if (!digits || raw.length > 12) return;
    const end = parseInt(digits, 10);
    const suffix = raw.replace(/^[\d\s .,]+/, '');
    const o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.4, ease: 'power3.out', onUpdate: () => { el.textContent = fmt(Math.round(o.v)) + suffix; } });
  };

  function updateUI(p: number) {
    // Portada
    const heroOut = smooth(PHASES.hero[1] * 0.4, PHASES.hero[1], p);
    hero.style.opacity = String(1 - heroOut);
    hero.style.transform = `translate3d(0, ${(-heroOut * 60).toFixed(1)}px, 0)`;
    hero.style.visibility = heroOut >= 1 ? 'hidden' : 'visible';
    hint.style.opacity = String(1 - smooth(0, 0.03, p));

    // Capítulos
    let now = -1;
    chapters.forEach((el, i) => {
      const [a, b] = PHASES[ids[i]];
      const span = b - a;
      const vin = smooth(a, a + span * 0.2, p);
      const vout = smooth(b - span * 0.16, b, p);
      const o = vin * (1 - vout);
      const y = (1 - vin) * 40 - vout * 40;
      el.style.opacity = o.toFixed(3);
      el.style.visibility = o > 0.01 ? 'visible' : 'hidden';
      el.style.transform = `translate3d(0, calc(${window.innerWidth > 860 ? '-50%' : '0px'} + ${y.toFixed(1)}px), 0)`;
      if (p >= a && p < b) now = i;
    });
    if (now !== active) {
      active = now;
      altSteps.forEach((s, i) => s.classList.toggle('is-on', i === now));
      if (now >= 0) chapters[now].querySelectorAll<HTMLElement>('.ch-stats dd').forEach(countUp);
    }
    root.classList.toggle('show-alt', p > PHASES.ruido[0] && p < PHASES.cordillera[0] + 0.02);

    // Altímetro: sube con la ruta de ascenso
    const alt = Math.max(altitude, 0);
    altFill.style.height = `${(alt * 100).toFixed(2)}%`;
    altMark.style.bottom = `${(alt * 100).toFixed(2)}%`;
    altVal.textContent = `${fmt(Math.round(alt * 2410))} m`;
    altTop.style.opacity = alt > 0.9 ? '0' : '1';

    // Cierre
    const o = smooth(PHASES.outro[0], PHASES.outro[0] + 0.04, p);
    outro.style.opacity = String(o);
    outro.style.visibility = o > 0.01 ? 'visible' : 'hidden';
    outro.style.transform = `translate3d(0, ${((1 - o) * 30).toFixed(1)}px, 0)`;
  }

  function frame(now: number) {
    requestAnimationFrame(frame);
    if (!visible) return;
    progress += (target - progress) * 0.14;
    if (Math.abs(target - progress) < 1e-5) progress = target;
    if (!scene) { updateUI(progress); return; }
    scene.renderOnce(progress, (now - t0) / 1000);
    updateUI(progress);
  }
  requestAnimationFrame(frame);

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '200px' }).observe(root);

  const makeLabel = (text: string, small = '', cls = '', dot = true) => {
    const el = document.createElement('div');
    el.className = `lbl ${cls}`;
    const span = document.createElement('span');
    if (dot) span.appendChild(document.createElement('i'));
    if (text) span.appendChild(document.createTextNode(text));
    if (small) { const sm = document.createElement('small'); sm.textContent = small; span.appendChild(sm); }
    el.appendChild(span);
    labelsBox.appendChild(el);
    return el;
  };

  const load = async () => {
    const { StoryScene } = await import('../scene/StoryScene');
    try {
      scene = new StoryScene(canvas, products, root.dataset.soon ?? '');
    } catch (err) {
      console.warn('[Ápice] WebGL no disponible, se usa la versión estática.', err);
      root.classList.remove('is-3d');
      ScrollTrigger.refresh();
      return;
    }
    const s = scene;
    // Rellena cifras reales de la escena
    root.querySelectorAll<HTMLElement>('[data-fill]').forEach((el) => {
      const v = el.dataset.fill!;
      el.textContent = v
        .replace('{points}', fmt(s.pointCount))
        .replace('{contours}', String(s.contourCount))
        .replace('{steps}', fmt(s.pathSteps))
        .replace('{products}', String(products.length));
    });
    // Etiquetas
    const P = PHASES;
    for (const { peak, pos } of s.peakLabelPositions()) {
      if (peak.kind === 'apex') {
        s.labels.push({ el: makeLabel('Ápice ', '· 2\u202f410 m', 'lbl--apex'), pos, from: P.cima[0] + 0.02, to: P.outro[0] + 0.01 });
      } else if (peak.kind === 'product') {
        const prod = products.find((x) => x.name === peak.label);
        const el = makeLabel(`${peak.label} `, `· ${prod?.statusLabel ?? ''}`);
        el.style.setProperty('--dot', peak.accent ?? '');
        s.labels.push({ el, pos, from: P.cordillera[0] + 0.03, to: P.outro[0] + 0.02 });
      } else {
        const el = makeLabel('', peak.label ?? '');
        el.style.setProperty('--dot', 'transparent');
        s.labels.push({ el, pos, from: P.cordillera[0] + 0.05, to: P.outro[0] + 0.02 });
      }
    }
    readout = makeLabel('', '', 'lbl--readout', false);
    const head = s.pathCurve.getPointAt(0).clone();
    s.labels.push({ el: readout, pos: head, from: P.ascenso[0] + 0.03, to: P.ascenso[1] });
    s.onFrame = ({ altitude: alt, head: h, iter }) => {
      altitude = alt;
      head.copy(h);
      if (readout) readout.firstElementChild!.textContent = `iter ${String(iter).padStart(4, '0')} · h = ${(alt).toFixed(3).replace('.', lang === 'es' ? ',' : '.')}`;
    };
    s.resize();
    s.renderOnce(progress, 0);
    root.classList.add('is-ready');
    let rt = 0;
    addEventListener('resize', () => { cancelAnimationFrame(rt); rt = requestAnimationFrame(() => s.resize()); });
  };

  const idle = (cb: () => void) => ('requestIdleCallback' in window ? (window as any).requestIdleCallback(cb, { timeout: 1200 }) : setTimeout(cb, 200));
  if (document.readyState === 'complete') idle(load); else addEventListener('load', () => idle(load), { once: true });
}
