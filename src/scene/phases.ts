/** Fases de la historia como fracciones del scroll total. Compartidas por la escena 3D y la interfaz. */
export const PHASES = {
  hero: [0, 0.07],
  ruido: [0.07, 0.19],
  estructura: [0.19, 0.32],
  modelo: [0.32, 0.47],
  ascenso: [0.47, 0.65],
  cima: [0.65, 0.78],
  cordillera: [0.78, 0.91],
  outro: [0.91, 1],
} as const;
export type PhaseId = keyof typeof PHASES;

/** Tamaño del mundo 3D (ancho, escala de altura, fondo). */
export const WORLD_SIZE = { x: 26, y: 6.4, z: 26 };
