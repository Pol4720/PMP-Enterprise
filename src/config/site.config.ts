/**
 * Configuración general del sitio.
 * Los valores marcados como PENDIENTE se rellenan antes del lanzamiento
 * (ver README → «Antes de lanzar»). Mientras estén pendientes, el sitio
 * funciona igual: muestra el aviso en el correo y no carga la analítica.
 */
export const PENDING = 'PENDIENTE';
export const isPending = (v: string | undefined | null) => !v || v.startsWith(PENDING);

export const site = {
  name: 'Ápice',
  /** Nombre usado en datos estructurados y avisos legales. */
  legalName: 'Ápice',
  /** Año de fundación que aparece en el pie y en los datos estructurados. */
  foundingYear: 2026,

  /** Correo público de contacto. */
  contactEmail: 'PENDIENTE-correo-de-contacto',

  /** Formulario de contacto (Formspree). Crea un formulario en formspree.io y pega aquí su ID (p. ej. «xyzabcd»). */
  formspreeId: 'PENDIENTE-id-formspree',

  /** Analítica sin cookies (GoatCounter). Pega aquí el código de tu cuenta (lo que va antes de .goatcounter.com). */
  goatcounterCode: 'PENDIENTE-codigo-goatcounter',

  /** Redes sociales: añade entradas { label, url } cuando existan. */
  social: [] as { label: string; url: string }[],

  /** Colores del navegador en móviles. */
  themeColor: '#0F1C26',
};
