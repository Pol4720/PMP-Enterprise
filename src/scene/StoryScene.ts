/**
 * Escena 3D de la historia «El ascenso».
 * Todo el estado visual es una función pura del progreso p ∈ [0, 1],
 * así que la escena funciona igual hacia delante y hacia atrás con el scroll.
 */
import * as THREE from 'three';
import { makeHeight, type Peak } from './terrain';
import type { TerrainData } from './terrain.worker';
import {
  particlesVert, particlesFrag, terrainVert, terrainFrag, pathVert, pathFrag,
  skyVert, skyFrag, beamVert, beamFrag,
} from './shaders';
import { PHASES, WORLD_SIZE } from './phases';

export type StoryProduct = { name: string; accent: string; status: string; statusLabel: string };
export type Label = { el: HTMLElement; pos: THREE.Vector3; from: number; to?: number };

const col = (hex: string) => new THREE.Color(hex);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export { PHASES } from './phases';

const WORLD = WORLD_SIZE;

import type { Quality } from './quality';

export class StoryScene {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera;
  clock = new THREE.Clock();
  progress = 0;
  target = 0;
  running = false;
  quality: Quality;
  portrait = false;
  h: (u: number, v: number) => number;
  peaks: Peak[];
  summit: THREE.Vector3;
  pathCurve!: THREE.CatmullRomCurve3;
  pathSteps = 0;
  pointCount = 0;
  contourCount = 22;
  labels: Label[] = [];
  onFrame?: (s: { progress: number; altitude: number; head: THREE.Vector3; iter: number }) => void;

  private particles!: THREE.Points;
  private pMat!: THREE.ShaderMaterial;
  private terrain!: THREE.Mesh;
  private tMat!: THREE.ShaderMaterial;
  private path!: THREE.Mesh;
  private pathMat!: THREE.ShaderMaterial;
  private head!: THREE.Sprite;
  private headLight!: THREE.Sprite;
  private sky!: THREE.Mesh;
  private skyMat!: THREE.ShaderMaterial;
  private diamond!: THREE.Group;
  private diamondGlow!: THREE.Sprite;
  private beam!: THREE.Mesh;
  private beamMat!: THREE.ShaderMaterial;
  private beacons: { group: THREE.Group; peak: Peak; glow: THREE.Sprite }[] = [];
  private camKeys: { p: number; pos: THREE.Vector3; look: THREE.Vector3 }[] = [];
  private fogUniforms = { uFogColor: { value: col('#0b1820') }, uFogNear: { value: 14 }, uFogFar: { value: 48 } };
  private tmpV = new THREE.Vector3();
  private tmpL = new THREE.Vector3();
  private raf = 0;
  private fpsSamples: number[] = [];
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement, data: TerrainData, quality: Quality) {
    this.canvas = canvas;
    this.quality = quality;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: this.quality === 'high', alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.quality === 'high' ? 2 : 1.5));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor('#08121A');
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 400);

    this.peaks = data.peaks;
    this.h = makeHeight(this.peaks);
    this.summit = this.toWorld(data.summit.u, data.summit.v, data.summit.h);

    this.buildSky();
    this.buildParticles(data);
    this.buildTerrain(data);
    this.buildPath(data);
    this.buildSummit();
    this.buildBeacons();
    this.buildCamera();
    this.resize();
  }

  /** Compila los shaders sin bloquear (si el navegador lo permite). */
  async warmUp() {
    try { await this.renderer.compileAsync(this.scene, this.camera); } catch { /* se compilan en el primer render */ }
  }

  toWorld(u: number, v: number, hv = this.h(u, v)) {
    return new THREE.Vector3((u - 0.5) * WORLD.x, hv * WORLD.y, (v - 0.5) * WORLD.z);
  }

  // ── Construcción ─────────────────────────────────────────────────────────
  private buildSky() {
    this.skyMat = new THREE.ShaderMaterial({
      vertexShader: skyVert, fragmentShader: skyFrag, side: THREE.BackSide, depthWrite: false,
      uniforms: {
        uDawn: { value: 0 }, uTime: { value: 0 },
        uNightTop: { value: col('#03080c') }, uNightHorizon: { value: col('#0e2230') },
        uDawnTop: { value: col('#14304d') }, uDawnMid: { value: col('#5f6a88') }, uDawnHorizon: { value: col('#e3b07d') },
        uSun: { value: col('#ffd9a0') }, uSunDir: { value: new THREE.Vector3(0.62, 0.035, -1).normalize() },
      },
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(200, 48, 24), this.skyMat);
    this.sky.renderOrder = -1;
    this.scene.add(this.sky);
  }

  private buildParticles(d: TerrainData) {
    const N = d.side * d.side;
    this.pointCount = N;
    const { grid, hs, chaos, rand } = d;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    g.setAttribute('aGrid', new THREE.BufferAttribute(grid, 2));
    g.setAttribute('aH', new THREE.BufferAttribute(hs, 1));
    g.setAttribute('aChaos', new THREE.BufferAttribute(chaos, 3));
    g.setAttribute('aRand', new THREE.BufferAttribute(rand, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 4, 0), 60);
    this.pMat = new THREE.ShaderMaterial({
      vertexShader: particlesVert, fragmentShader: particlesFrag,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 }, uOrder: { value: 0 }, uRise: { value: 0 },
        uSize: { value: this.quality === 'low' ? 110 : 88 }, uPixelRatio: { value: this.renderer.getPixelRatio() }, uAlpha: { value: 1 },
        uWorld: { value: new THREE.Vector3(WORLD.x, WORLD.y, WORLD.z) },
        uLow: { value: col('#2f8f9a') }, uMid: { value: col('#9fd3d8') }, uHigh: { value: col('#f1f5f4') }, uGold: { value: col('#e8b04e') },
        ...this.fogUniforms,
      },
    });
    this.particles = new THREE.Points(g, this.pMat);
    this.particles.renderOrder = 2;
    this.scene.add(this.particles);
  }

  private buildTerrain(d: TerrainData) {
    const g = new THREE.PlaneGeometry(WORLD.x, WORLD.z, d.seg, d.seg);
    g.rotateX(-Math.PI / 2);
    g.setAttribute('aH', new THREE.BufferAttribute(d.meshH, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 3, 0), 30);
    this.tMat = new THREE.ShaderMaterial({
      vertexShader: terrainVert, fragmentShader: terrainFrag, transparent: true,
      uniforms: {
        uRise: { value: 0 }, uHScale: { value: WORLD.y }, uOpacity: { value: 0 }, uReveal: { value: 0 },
        uLines: { value: this.contourCount }, uTime: { value: 0 }, uPulse: { value: 0 }, uPulseStrength: { value: 0 }, uDawn: { value: 0 },
        uSummit: { value: this.summit }, uLineLow: { value: col('#3aa5b0') }, uLineHigh: { value: col('#e6f1f0') }, uGold: { value: col('#e8b04e') },
        uRockDark: { value: col('#07121a') }, uRockLight: { value: col('#24465a') }, uHalf: { value: new THREE.Vector2(WORLD.x / 2, WORLD.z / 2) }, uSunDir: { value: new THREE.Vector3(0.5, 0.55, -0.8).normalize() },
        ...this.fogUniforms,
      },
    });
    this.terrain = new THREE.Mesh(g, this.tMat);
    this.terrain.renderOrder = 1;
    this.scene.add(this.terrain);
  }

  private glowTexture(inner = 'rgba(255,230,170,1)', outer = 'rgba(232,176,78,0)') {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d')!;
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, inner); g.addColorStop(0.18, 'rgba(240,190,100,0.55)'); g.addColorStop(1, outer);
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }

  private buildPath(d: TerrainData) {
    const n = d.path.length / 3;
    this.pathSteps = n;
    const sampled: THREE.Vector3[] = [];
    for (let i = 0; i < n; i++) {
      if (i % 6 !== 0 && i !== n - 1) continue;
      sampled.push(this.toWorld(d.path[i * 3], d.path[i * 3 + 1], d.path[i * 3 + 2]).add(new THREE.Vector3(0, 0.12, 0)));
    }
    this.pathCurve = new THREE.CatmullRomCurve3(sampled, false, 'centripetal');
    const geo = new THREE.TubeGeometry(this.pathCurve, 900, 0.028, 8, false);
    this.pathMat = new THREE.ShaderMaterial({
      vertexShader: pathVert, fragmentShader: pathFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uProgress: { value: 0 }, uFade: { value: 1 }, uTime: { value: 0 }, uColor: { value: col('#7cc2c8') }, uHead: { value: col('#ffd890') } },
    });
    this.path = new THREE.Mesh(geo, this.pathMat);
    this.path.renderOrder = 3;
    this.scene.add(this.path);
    const tex = this.glowTexture();
    this.head = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    this.head.scale.setScalar(0.9);
    this.headLight = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.35 }));
    this.headLight.scale.setScalar(3.2);
    this.head.renderOrder = this.headLight.renderOrder = 4;
    this.scene.add(this.head, this.headLight);
  }

  private buildSummit() {
    this.diamond = new THREE.Group();
    const geo = new THREE.OctahedronGeometry(0.42, 0);
    geo.scale(1, 1.35, 1);
    const mat = new THREE.MeshStandardMaterial({ color: col('#e8b04e'), emissive: col('#7a4e0e'), metalness: 0.55, roughness: 0.28, flatShading: true });
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: col('#fff1cf'), transparent: true, opacity: 0.85 }));
    const gem = new THREE.Mesh(geo, mat);
    this.diamond.add(gem, edges);
    this.diamond.position.copy(this.summit).add(new THREE.Vector3(0, 1.1, 0));
    this.diamond.scale.setScalar(0.001);
    this.diamondGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }));
    this.diamondGlow.position.copy(this.diamond.position);
    this.diamondGlow.scale.setScalar(3.2);
    this.beamMat = new THREE.ShaderMaterial({
      vertexShader: beamVert, fragmentShader: beamFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: { uIntensity: { value: 0 }, uColor: { value: col('#f3c573') } },
    });
    const beamGeo = new THREE.CylinderGeometry(0.05, 0.32, 30, 32, 1, true);
    beamGeo.translate(0, 15, 0);
    this.beam = new THREE.Mesh(beamGeo, this.beamMat);
    this.beam.position.copy(this.summit);
    this.beam.renderOrder = 5;
    const key = new THREE.DirectionalLight('#fff4dc', 2.6); key.position.set(4, 8, 6);
    const fill = new THREE.DirectionalLight('#7cc2c8', 1.2); fill.position.set(-6, 2, -4);
    this.scene.add(new THREE.AmbientLight('#ffffff', 0.35), key, fill);
    this.scene.add(this.diamond, this.diamondGlow, this.beam);
  }

  private buildBeacons() {
    const tex = this.glowTexture('rgba(255,255,255,1)', 'rgba(255,255,255,0)');
    this.peaks.slice(1).forEach((peak) => {
      const group = new THREE.Group();
      const geo = new THREE.OctahedronGeometry(0.22, 0); geo.scale(1, 1.35, 1);
      const accent = peak.kind === 'product' ? col(peak.accent!) : col('#9fb4bd');
      const mesh = peak.kind === 'product'
        ? new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: accent }))
        : new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: accent }));
      group.add(mesh);
      const top = this.toWorld(peak.u, peak.v);
      group.position.copy(top).add(new THREE.Vector3(0, 0.7, 0));
      group.scale.setScalar(0.001);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: accent, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }));
      glow.position.copy(group.position); glow.scale.setScalar(2.2);
      this.scene.add(group, glow);
      this.beacons.push({ group, peak, glow });
    });
  }

  private buildCamera() {
    const s = this.summit;
    const start = this.pathCurve.getPointAt(0);
    const k = (p: number, pos: number[], look: number[]) => ({ p, pos: new THREE.Vector3(...pos), look: new THREE.Vector3(...look) });
    // Las posiciones del ascenso se toman de la propia ruta (cámara que persigue).
    const chase = (t: number, back = 4.2, up = 2.6, side = 1.6) => {
      const p = this.pathCurve.getPointAt(t);
      const tan = this.pathCurve.getTangentAt(Math.min(0.999, t + 0.02)).setY(0).normalize();
      const right = new THREE.Vector3(-tan.z, 0, tan.x);
      return { pos: p.clone().addScaledVector(tan, -back).add(new THREE.Vector3(0, up, 0)).addScaledVector(right, side), look: this.pathCurve.getPointAt(Math.min(1, t + 0.12)) };
    };
    const c1 = chase(0.02, 7, 4.5, 3), c2 = chase(0.35, 7, 4.2, 3.2), c3 = chase(0.7, 6.5, 4, 2.6), c4 = chase(0.96, 6, 3.4, -2);
    this.camKeys = [
      k(0.0, [0, 6.5, 26], [0, 5, 0]),
      k(0.07, [2, 6.8, 22], [0, 4.6, 0]),
      k(0.19, [-6, 9, 19], [0, 3.2, 0]),
      k(0.32, [0, 22, 15], [0, 0, 0.5]),
      k(0.4, [13, 13, 15], [0, 1.5, 0]),
      k(0.47, [start.x + 7, start.y + 6, start.z + 8], [start.x * 0.4, 1.8, start.z * 0.4]),
      { p: 0.51, ...c1 },
      { p: 0.57, ...c2 },
      { p: 0.62, ...c3 },
      { p: 0.66, ...c4 },
      k(0.72, [s.x + 5.5, s.y + 2.6, s.z + 7.5], [s.x, s.y + 1.2, s.z]),
      k(0.78, [s.x - 7, s.y + 3.4, s.z + 5.5], [s.x, s.y + 0.9, s.z]),
      k(0.86, [-5, 15, 19], [0, 1.6, 0.5]),
      k(0.93, [0, 10.5, 24], [0, 3, -2]),
      k(1.0, [0, 9.5, 26], [0, 4, -4]),
    ];
  }

  // ── Estado en función del progreso ───────────────────────────────────────
  private cameraAt(p: number) {
    const K = this.camKeys;
    let i = 0;
    while (i < K.length - 2 && p > K[i + 1].p) i++;
    const a = K[Math.max(0, i - 1)], b = K[i], c = K[i + 1], d = K[Math.min(K.length - 1, i + 2)];
    const t = smooth(0, 1, clamp01((p - b.p) / (c.p - b.p || 1)));
    const cr = (p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3, out: THREE.Vector3) => {
      const t2 = t * t, t3 = t2 * t;
      return out.set(0, 0, 0)
        .addScaledVector(p0, -0.5 * t3 + t2 - 0.5 * t)
        .addScaledVector(p1, 1.5 * t3 - 2.5 * t2 + 1)
        .addScaledVector(p2, -1.5 * t3 + 2 * t2 + 0.5 * t)
        .addScaledVector(p3, 0.5 * t3 - 0.5 * t2);
    };
    cr(a.pos, b.pos, c.pos, d.pos, this.tmpV);
    cr(a.look, b.look, c.look, d.look, this.tmpL);
  }

  private apply(p: number, time: number) {
    const P = PHASES;
    const order = smooth(P.estructura[0] - 0.01, P.estructura[1] - 0.02, p);
    const rise = smooth(P.modelo[0], P.modelo[0] + 0.09, p);
    const reveal = lerp(0, 1.08, smooth(P.modelo[0] + 0.03, P.modelo[1], p));
    const terrainOp = smooth(P.modelo[0] + 0.01, P.modelo[0] + 0.08, p);
    const pathP = smooth(P.ascenso[0] + 0.02, P.ascenso[1] + 0.005, p);
    const gem = smooth(P.cima[0] - 0.005, P.cima[0] + 0.04, p);
    const pulseT = smooth(P.cima[0] + 0.01, P.cordillera[0] + 0.05, p);
    const beacons = smooth(P.cordillera[0], P.cordillera[0] + 0.06, p);
    const dawn = 0.85 * smooth(P.cima[0] + 0.06, P.outro[0] + 0.05, p);

    const u = this.pMat.uniforms;
    u.uTime.value = time; u.uOrder.value = order; u.uRise.value = rise;
    u.uAlpha.value = lerp(1, 0.32, terrainOp) * (1 - 0.35 * dawn);
    const tu = this.tMat.uniforms;
    tu.uRise.value = rise; tu.uOpacity.value = terrainOp; tu.uReveal.value = reveal; tu.uTime.value = time; tu.uDawn.value = dawn;
    tu.uPulse.value = pulseT * 22; tu.uPulseStrength.value = pulseT > 0 && pulseT < 1 ? Math.sin(pulseT * Math.PI) : 0;
    this.terrain.visible = terrainOp > 0.001;

    this.pathMat.uniforms.uProgress.value = pathP;
    this.pathMat.uniforms.uTime.value = time;
    this.pathMat.uniforms.uFade.value = 1 - 0.65 * smooth(P.cima[0], P.cima[0] + 0.05, p);
    this.path.visible = pathP > 0.001;
    const head = this.pathCurve.getPointAt(Math.max(0.0001, pathP));
    const headVis = pathP > 0.001 ? (1 - smooth(P.cima[0] + 0.01, P.cima[0] + 0.04, p)) : 0;
    this.head.position.copy(head); this.headLight.position.copy(head);
    (this.head.material as THREE.SpriteMaterial).opacity = headVis;
    (this.headLight.material as THREE.SpriteMaterial).opacity = headVis * (0.3 + 0.1 * Math.sin(time * 4));

    const gs = gem * (1 + 0.05 * Math.sin(time * 2));
    this.diamond.scale.setScalar(Math.max(0.001, gs));
    this.diamond.rotation.y = time * 0.5;
    this.diamond.position.y = this.summit.y + 1.1 + Math.sin(time * 1.3) * 0.08;
    (this.diamondGlow.material as THREE.SpriteMaterial).opacity = gem * (0.5 + 0.15 * Math.sin(time * 2.2));
    this.diamondGlow.scale.setScalar(2.4 + gem * 1.4);
    this.beamMat.uniforms.uIntensity.value = gem * (1 - smooth(P.cordillera[1], P.outro[0] + 0.04, p)) * (0.85 + 0.15 * Math.sin(time * 3));
    this.beam.visible = gem > 0.01;

    this.beacons.forEach((b, i) => {
      const s = smooth(0, 1, beacons * 1.4 - i * 0.12);
      b.group.scale.setScalar(Math.max(0.001, s));
      b.group.rotation.y = time * 0.6 + i;
      b.group.position.y = this.toWorld(b.peak.u, b.peak.v).y + 0.7 + Math.sin(time * 1.5 + i) * 0.06;
      (b.glow.material as THREE.SpriteMaterial).opacity = s * (b.peak.kind === 'product' ? 0.7 : 0.25);
    });

    this.skyMat.uniforms.uDawn.value = dawn;
    this.skyMat.uniforms.uTime.value = time;
    this.fogUniforms.uFogColor.value.copy(col('#0b1820')).lerp(col('#4b5468'), dawn);
    this.fogUniforms.uFogNear.value = lerp(16, 22, smooth(P.cordillera[0], P.outro[0], p));
    this.fogUniforms.uFogFar.value = lerp(52, 70, smooth(P.cordillera[0], P.outro[0], p));
    this.renderer.setClearColor(this.fogUniforms.uFogColor.value);

    this.cameraAt(p);
    // Ligera deriva viva incluso sin scroll
    this.tmpV.x += Math.sin(time * 0.21) * 0.25;
    this.tmpV.y += Math.sin(time * 0.17) * 0.15;
    if (this.portrait) this.tmpV.add(this.tmpV.clone().sub(this.tmpL).multiplyScalar(0.32));
    this.camera.position.copy(this.tmpV);
    this.camera.lookAt(this.tmpL);

    const altitude = pathP > 0 ? head.y / this.summit.y : 0;
    this.onFrame?.({ progress: p, altitude: p >= P.cima[0] ? 1 : altitude, head, iter: Math.round(pathP * this.pathSteps) });
  }

  // ── Etiquetas HTML proyectadas ───────────────────────────────────────────
  peakLabelPositions() {
    return this.peaks.map((pk) => ({ peak: pk, pos: this.toWorld(pk.u, pk.v).add(new THREE.Vector3(0, pk.kind === 'apex' ? 2.1 : 1.35, 0)) }));
  }
  private updateLabels(p: number) {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    for (const l of this.labels) {
      const vis = l.to === undefined ? smooth(l.from, l.from + 0.03, p) : smooth(l.from, l.from + 0.03, p) * (1 - smooth(l.to - 0.03, l.to, p));
      if (vis <= 0.001) { l.el.style.opacity = '0'; l.el.style.visibility = 'hidden'; continue; }
      this.tmpV.copy(l.pos).project(this.camera);
      const behind = this.tmpV.z > 1;
      const m = Math.min(90, w * 0.2);
      const x = Math.min(w - m, Math.max(m, (this.tmpV.x * 0.5 + 0.5) * w)), y = (-this.tmpV.y * 0.5 + 0.5) * h;
      l.el.style.visibility = behind ? 'hidden' : 'visible';
      l.el.style.opacity = String(vis);
      l.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    }
  }

  // ── Ciclo de vida ────────────────────────────────────────────────────────
  resize() {
    const w = this.canvas.clientWidth || window.innerWidth, h = this.canvas.clientHeight || window.innerHeight;
    this.portrait = h > w * 1.1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.fov = this.portrait ? 58 : 42;
    this.camera.updateProjectionMatrix();
    this.pMat.uniforms.uPixelRatio.value = this.renderer.getPixelRatio();
  }

  renderOnce(p = this.progress, time = this.clock.getElapsedTime()) {
    this.apply(p, time);
    this.renderer.render(this.scene, this.camera);
    this.updateLabels(p);
  }

  start() {
    if (this.running) return;
    this.running = true;
    let last = performance.now();
    const loop = (now: number) => {
      if (!this.running) return;
      this.raf = requestAnimationFrame(loop);
      const dt = now - last; last = now;
      // Calidad adaptativa: si los primeros segundos van lentos, bajamos la resolución
      if (this.fpsSamples.length < 90) {
        this.fpsSamples.push(dt);
        if (this.fpsSamples.length === 90) {
          const avg = this.fpsSamples.slice(20).reduce((a, b) => a + b, 0) / 70;
          if (avg > 22 && this.renderer.getPixelRatio() > 1) { this.renderer.setPixelRatio(1); this.resize(); }
        }
      }
      this.progress += (this.target - this.progress) * Math.min(1, dt / 90);
      if (Math.abs(this.target - this.progress) < 0.00005) this.progress = this.target;
      this.renderOnce(this.progress);
    };
    this.raf = requestAnimationFrame(loop);
  }
  stop() { this.running = false; cancelAnimationFrame(this.raf); }
  dispose() {
    this.stop();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose?.();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else mat?.dispose?.();
    });
    this.renderer.dispose();
  }
}
