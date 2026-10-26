/** Shaders GLSL de la escena. Colores en espacio lineal aproximado a la paleta Altitud. */

export const fogChunk = /* glsl */ `
  uniform vec3 uFogColor;
  uniform float uFogNear;
  uniform float uFogFar;
  vec3 applyFog(vec3 col, float depth) {
    float f = smoothstep(uFogNear, uFogFar, depth);
    return mix(col, uFogColor, f);
  }
`;

export const particlesVert = /* glsl */ `
  attribute vec3 aChaos;
  attribute vec2 aGrid;
  attribute float aH;
  attribute float aRand;
  uniform float uTime;
  uniform float uOrder;   // 0 = caos, 1 = malla ordenada
  uniform float uRise;    // 0 = plano, 1 = terreno
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uAlpha;
  uniform vec3 uWorld;    // ancho, alto (escala de altura), fondo
  varying float vH;
  varying float vAlpha;
  varying float vDepth;
  varying float vSpark;
  varying float vFlat;

  mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

  void main() {
    // Caos: nubes de distintas fuentes que giran lentamente
    vec3 c = aChaos;
    c.xz = rot(uTime * (0.03 + aRand * 0.05)) * c.xz;
    c.y += sin(uTime * 0.6 + aRand * 40.0) * 0.25;
    c.x += sin(uTime * 0.4 + aChaos.y * 0.7) * 0.18;

    float o = smoothstep(aRand * 0.45, aRand * 0.45 + 0.55, uOrder);
    float r = smoothstep(aRand * 0.35, aRand * 0.35 + 0.65, uRise);
    vec3 flatP = vec3((aGrid.x - 0.5) * uWorld.x, 0.0, (aGrid.y - 0.5) * uWorld.z);
    vec3 ordered = flatP + vec3(0.0, aH * uWorld.y * r + 0.04, 0.0);
    vec3 pos = mix(c, ordered, o);
    // Arco durante la transición: los datos «vuelan» a su sitio
    pos.y += sin(o * 3.14159) * (1.5 + aRand * 2.5);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    float twinkle = 0.75 + 0.25 * sin(uTime * (1.5 + aRand * 3.0) + aRand * 60.0);
    gl_PointSize = uSize * uPixelRatio * (0.55 + aRand * 0.9) * (1.0 + aH * r * 0.8) * twinkle / max(0.5, -mv.z);
    vH = aH * r;
    float ef = 1.0 - smoothstep(0.62, 0.98, length((aGrid - 0.5) * 2.0));
    vAlpha = uAlpha * (0.45 + 0.55 * aRand) * mix(1.0, ef, o);
    vDepth = -mv.z;
    vSpark = (1.0 - o) * step(0.985, aRand);
    vFlat = o * (1.0 - r);
    vAlpha *= 1.0 + vFlat * 0.9;
  }
`;

export const particlesFrag = /* glsl */ `
  uniform vec3 uLow;
  uniform vec3 uMid;
  uniform vec3 uHigh;
  uniform vec3 uGold;
  ${fogChunk}
  varying float vH;
  varying float vAlpha;
  varying float vDepth;
  varying float vSpark;
  varying float vFlat;
  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float d = length(p);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);
    core = pow(core, 1.6);
    vec3 col = mix(uLow, uMid, smoothstep(0.05, 0.55, vH));
    col = mix(col, uHigh, smoothstep(0.55, 0.85, vH));
    col = mix(col, uGold, smoothstep(0.86, 1.0, vH));
    col = mix(col, uGold, vSpark);
    col = mix(col, uMid, vFlat * 0.55);
    col = applyFog(col, vDepth);
    float fogA = 1.0 - smoothstep(uFogNear, uFogFar * 1.1, vDepth);
    gl_FragColor = vec4(col, core * vAlpha * fogA);
  }
`;

export const terrainVert = /* glsl */ `
  attribute float aH;
  uniform float uRise;
  uniform float uHScale;
  varying float vH;
  varying vec3 vWorld;
  varying vec3 vNormalW;
  varying float vDepth;
  void main() {
    vec3 p = position;
    p.y = aH * uHScale * uRise;
    vec4 w = modelMatrix * vec4(p, 1.0);
    vWorld = w.xyz;
    vH = aH;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 mv = viewMatrix * w;
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

export const terrainFrag = /* glsl */ `
  uniform float uOpacity;
  uniform float uReveal;
  uniform float uLines;
  uniform float uTime;
  uniform float uPulse;
  uniform float uPulseStrength;
  uniform float uDawn;
  uniform vec3 uSummit;
  uniform vec3 uLineLow;
  uniform vec3 uLineHigh;
  uniform vec3 uGold;
  uniform vec3 uRockDark;
  uniform vec3 uRockLight;
  uniform vec3 uSunDir;
  ${fogChunk}
  uniform vec2 uHalf;
  varying float vH;
  varying vec3 vWorld;
  varying vec3 vNormalW;
  varying float vDepth;

  void main() {
    vec2 e = abs(vWorld.xz) / uHalf;
    float edge = 1.0 - smoothstep(0.62, 0.98, length(e * vec2(1.0, 1.05)));
    if (edge <= 0.0) discard;
    vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
    if (n.y < 0.0) n = -n;
    float diff = clamp(dot(n, normalize(uSunDir)), 0.0, 1.0);
    float rim = pow(1.0 - clamp(n.y, 0.0, 1.0), 2.0);
    vec3 base = mix(uRockDark, uRockLight, diff * 0.9 + 0.1);
    base += uGold * uDawn * pow(diff, 3.0) * 0.55;
    base += uLineLow * rim * 0.12;

    // Curvas de nivel antialias con derivadas
    float x = vH * uLines;
    float fw = fwidth(x);
    float dist = abs(fract(x - 0.5) - 0.5);
    float line = 1.0 - smoothstep(0.0, fw * 1.2, dist);
    float idx = floor(x + 0.5);
    float major = 1.0 - step(0.5, mod(idx, 5.0));
    // Retícula de levantamiento muy tenue
    vec2 g = vWorld.xz * 0.5;
    vec2 gw = fwidth(g);
    vec2 gd = abs(fract(g - 0.5) - 0.5) / max(gw, 1e-4);
    float gridL = (1.0 - min(min(gd.x, gd.y), 1.0)) * 0.05;

    vec3 lineCol = mix(uLineLow, uLineHigh, smoothstep(0.25, 0.85, vH));
    lineCol = mix(lineCol, uGold, smoothstep(0.86, 0.98, vH));

    float revealed = 1.0 - smoothstep(uReveal - 0.004, uReveal + 0.004, vH);
    float fwH = max(fwidth(vH), 1e-4);
    float front = (1.0 - smoothstep(0.0, fwH * 2.5, abs(vH - uReveal))) * step(0.001, uReveal) * (1.0 - step(1.05, uReveal));

    // Onda que sale de la cima al alcanzarla
    float dS = distance(vWorld.xz, uSummit.xz);
    float ring = exp(-pow((dS - uPulse) * 0.9, 2.0)) * uPulseStrength;

    vec3 col = base;
    col += lineCol * line * (0.45 + 0.55 * major) * revealed * (0.8 + ring * 2.5);
    col += mix(uLineHigh, uGold, 0.5) * front * 0.9;
    col += uGold * ring * 0.08;
    col += uLineLow * gridL * revealed;
    col = applyFog(col, vDepth);
    gl_FragColor = vec4(col, uOpacity * edge);
  }
`;

export const pathVert = /* glsl */ `
  varying vec2 vUv;
  varying float vDepth;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

export const pathFrag = /* glsl */ `
  uniform float uProgress;
  uniform float uFade;
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uHead;
  varying vec2 vUv;
  varying float vDepth;
  void main() {
    float t = vUv.x;
    if (t > uProgress) discard;
    float tail = smoothstep(uProgress - 0.35, uProgress, t);
    float pulse = 0.85 + 0.15 * sin(t * 90.0 - uTime * 3.0);
    float across = 1.0 - abs(vUv.y - 0.5) * 2.0;
    vec3 col = mix(uColor, uHead, tail);
    float a = (0.4 + 0.6 * tail) * pulse * (0.55 + 0.45 * across);
    gl_FragColor = vec4(col * (0.9 + 0.6 * tail), a * uFade);
  }
`;

export const skyVert = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position = p.xyww;
  }
`;

export const skyFrag = /* glsl */ `
  uniform float uDawn;
  uniform float uTime;
  uniform vec3 uNightTop;
  uniform vec3 uNightHorizon;
  uniform vec3 uDawnTop;
  uniform vec3 uDawnHorizon;
  uniform vec3 uDawnMid;
  uniform vec3 uSun;
  uniform vec3 uSunDir;
  varying vec3 vDir;
  float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  void main() {
    vec3 d = normalize(vDir);
    float y = d.y;
    float hz = 1.0 - smoothstep(-0.05, 0.45, y);
    vec3 night = mix(uNightTop, uNightHorizon, hz);
    vec3 dawn = mix(uDawnTop, uDawnMid, smoothstep(0.6, 0.12, y));
    dawn = mix(dawn, uDawnHorizon, smoothstep(0.2, -0.02, y));
    vec3 col = mix(night, dawn, uDawn);
    // Sol saliendo por el horizonte
    float sd = max(dot(d, normalize(uSunDir)), 0.0);
    col += uSun * (smoothstep(0.99985, 0.99995, sd) * 0.8 + pow(sd, 400.0) * 0.4 + pow(sd, 30.0) * 0.12 + pow(sd, 4.0) * 0.05) * uDawn;
    // Estrellas
    vec3 q = d * 420.0;
    vec3 cell = floor(q);
    float h = hash(cell);
    float sz = length(fract(q) - 0.5);
    float star = step(0.992, h) * (1.0 - smoothstep(0.05, 0.22, sz)) * smoothstep(0.02, 0.3, y);
    float tw = 0.6 + 0.4 * sin(uTime * 2.0 + h * 100.0);
    col += vec3(0.85, 0.9, 1.0) * star * tw * (1.0 - uDawn) * 0.9;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export const beamFrag = /* glsl */ `
  uniform float uIntensity;
  uniform vec3 uColor;
  varying vec2 vUv;
  varying float vEdge;
  void main() {
    float fadeY = pow(1.0 - vUv.y, 2.2);
    gl_FragColor = vec4(uColor, fadeY * uIntensity * 0.5 * pow(vEdge, 3.0));
  }
`;
export const beamVert = /* glsl */ `
  varying vec2 vUv;
  varying float vEdge;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normal);
    vEdge = abs(dot(n, normalize(-mv.xyz)));
    gl_Position = projectionMatrix * mv;
  }
`;
