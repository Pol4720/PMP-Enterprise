/**
 * Tokens de diseño de Ápice: la única fuente de verdad visual.
 * El sitio los convierte en variables CSS (ver `tokensToCss`) y el Brand Guidelines
 * los lee directamente, así que cambiar un valor aquí lo cambia en todas partes.
 */

export type Swatch = {
  name: string;
  hex: string;
  rgb: string;
  hsl: string;
  role: string;
};

/** Paleta «Altitud». Ratios de contraste calculados con la fórmula WCAG 2.1. */
export const palette = {
  night: { name: 'Noche alpina', hex: '#0F1C26', rgb: '15 28 38', hsl: '206° 43% 10%', role: 'Texto principal, fondos oscuros' },
  deep: { name: 'Abismo', hex: '#08121A', rgb: '8 18 26', hsl: '207° 53% 7%', role: 'Cielo nocturno de la escena 3D' },
  slate: { name: 'Pizarra', hex: '#3B4B57', rgb: '59 75 87', hsl: '206° 19% 29%', role: 'Texto secundario' },
  mist: { name: 'Niebla', hex: '#EEF1F0', rgb: '238 241 240', hsl: '160° 10% 94%', role: 'Fondo claro principal' },
  snow: { name: 'Nieve', hex: '#F8FAF9', rgb: '248 250 249', hsl: '150° 17% 98%', role: 'Superficies elevadas' },
  rock: { name: 'Roca', hex: '#CDD4D3', rgb: '205 212 211', hsl: '171° 8% 82%', role: 'Líneas y bordes' },
  glacier: { name: 'Glaciar', hex: '#25707A', rgb: '37 112 122', hsl: '187° 53% 31%', role: 'Acento sobre claro (texto, enlaces)' },
  glacierLight: { name: 'Glaciar claro', hex: '#7CC2C8', rgb: '124 194 200', hsl: '185° 41% 64%', role: 'Acento sobre oscuro' },
  dawn: { name: 'Alba', hex: '#D9A441', rgb: '217 164 65', hsl: '39° 67% 55%', role: 'La cima. Solo para el punto dorado y momentos clave' },
  dawnText: { name: 'Alba profunda', hex: '#8A5E12', rgb: '138 94 18', hsl: '38° 77% 31%', role: 'Dorado legible sobre claro' },
} satisfies Record<string, Swatch>;

/** Contraste medido (WCAG 2.1) de las combinaciones de uso habitual. */
export const contrast = [
  { fg: 'night', bg: 'mist', ratio: 15.21, level: 'AAA' },
  { fg: 'slate', bg: 'mist', ratio: 7.93, level: 'AAA' },
  { fg: 'glacier', bg: 'mist', ratio: 5.02, level: 'AA' },
  { fg: 'dawnText', bg: 'mist', ratio: 5.01, level: 'AA' },
  { fg: 'mist', bg: 'night', ratio: 15.21, level: 'AAA' },
  { fg: 'glacierLight', bg: 'night', ratio: 8.57, level: 'AAA' },
  { fg: 'dawn', bg: 'night', ratio: 7.69, level: 'AAA' },
  { fg: 'rock', bg: 'night', ratio: 11.49, level: 'AAA' },
] as const;

/** Temas semánticos: los componentes solo usan estos nombres. */
export const themes = {
  light: {
    bg: palette.mist.hex,
    surface: palette.snow.hex,
    fg: palette.night.hex,
    muted: palette.slate.hex,
    line: palette.rock.hex,
    accent: palette.glacier.hex,
    gold: palette.dawn.hex,
    goldText: palette.dawnText.hex,
    inverseBg: palette.night.hex,
    inverseFg: palette.mist.hex,
  },
  dark: {
    bg: palette.night.hex,
    surface: '#142632',
    fg: '#E7ECEB',
    muted: '#A9B6BD',
    line: '#26394A',
    accent: palette.glacierLight.hex,
    gold: palette.dawn.hex,
    goldText: palette.dawn.hex,
    inverseBg: palette.mist.hex,
    inverseFg: palette.night.hex,
  },
} as const;

export const typography = {
  families: {
    display: { name: 'Newsreader', stack: "'Newsreader Variable', 'Iowan Old Style', Georgia, serif", license: 'SIL Open Font License 1.1', role: 'Titulares y frases de marca' },
    sans: { name: 'Instrument Sans', stack: "'Instrument Sans Variable', 'Segoe UI', system-ui, sans-serif", license: 'SIL Open Font License 1.1', role: 'Texto e interfaz' },
    mono: { name: 'JetBrains Mono', stack: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace", license: 'SIL Open Font License 1.1', role: 'Datos, cifras y anotaciones' },
  },
  /** Escala fluida (min → max entre 360 y 1440 px de ancho). */
  scale: {
    'xs': 'clamp(0.75rem, 0.73rem + 0.1vw, 0.8rem)',
    'sm': 'clamp(0.875rem, 0.85rem + 0.12vw, 0.95rem)',
    'base': 'clamp(1rem, 0.96rem + 0.18vw, 1.125rem)',
    'lg': 'clamp(1.2rem, 1.1rem + 0.4vw, 1.45rem)',
    'xl': 'clamp(1.5rem, 1.3rem + 0.9vw, 2.1rem)',
    '2xl': 'clamp(2rem, 1.6rem + 1.8vw, 3.2rem)',
    '3xl': 'clamp(2.6rem, 1.9rem + 3.2vw, 4.8rem)',
    '4xl': 'clamp(3.2rem, 2rem + 5.4vw, 7.2rem)',
  },
} as const;

/** Espaciado en base 4 px. */
export const space = {
  '1': '0.25rem', '2': '0.5rem', '3': '0.75rem', '4': '1rem', '5': '1.5rem',
  '6': '2rem', '7': '3rem', '8': '4rem', '9': '6rem', '10': '8rem', '11': '12rem',
} as const;

export const radius = { none: '0', sm: '2px', md: '6px', pill: '999px' } as const;

/** Movimiento: lento y seguro, como un ascenso. Nada rebota. */
export const motion = {
  duration: { fast: '180ms', base: '320ms', slow: '700ms', epic: '1400ms' },
  ease: {
    ascent: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
    out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
} as const;

export const layout = { maxWidth: '1240px', textWidth: '68ch', gutter: 'clamp(1rem, 0.5rem + 2.4vw, 3rem)' } as const;

const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());

/** Convierte los tokens en variables CSS (modo claro + oscuro automático). */
export function tokensToCss(): string {
  const vars = (o: Record<string, string>, prefix: string) =>
    Object.entries(o).map(([k, v]) => `--${prefix}${kebab(k)}:${v};`).join('');
  const base =
    vars(Object.fromEntries(Object.entries(palette).map(([k, v]) => [k, v.hex])), 'c-') +
    vars(themes.light, '') +
    Object.entries(typography.families).map(([k, v]) => `--font-${k}:${v.stack};`).join('') +
    vars(typography.scale, 'text-') +
    vars(space, 'space-') +
    vars(radius, 'radius-') +
    vars(motion.duration, 'dur-') +
    vars(motion.ease, 'ease-') +
    vars(layout, '');
  return `:root{${base}color-scheme:light}` +
    `@media (prefers-color-scheme:dark){:root{${vars(themes.dark, '')}color-scheme:dark}}`;
}
