# Atribuciones y licencias

Registro del origen y la licencia de cada recurso usado en el sitio y en la marca de Ápice.

## Recursos visuales

| Recurso | Origen | Licencia |
|---|---|---|
| Logo, isotipo y logotipo de Ápice | Diseño original, generado con `scripts/brand/build-logos.mjs` | Propiedad de Ápice |
| Escena 3D de la historia (terreno, partículas, cielo, ruta) | Original, generada por código (`src/scene/`) | Propiedad de Ápice |
| Emblemas topográficos | Originales, generados por código (`src/lib/topo.ts`) | Propiedad de Ápice |
| Iconos | Originales (`src/components/Icon.astro`) | Propiedad de Ápice |
| Láminas estáticas de la historia (`public/story/`) | Capturas de la escena original | Propiedad de Ápice |
| Tarjetas, plantillas, firma, piezas para redes, imágenes OG | Originales, generadas por código | Propiedad de Ápice |

No se usan fotografías, vídeos ni ilustraciones de terceros. Si en el futuro se añaden, regístralos aquí con su autor,
URL y licencia (preferiblemente Unsplash, Pexels o CC0).

## Tipografías

| Familia | Autor | Licencia | Distribución |
|---|---|---|---|
| Newsreader | Production Type | SIL Open Font License 1.1 | Google Fonts, vía Fontsource |
| Instrument Sans | Instrument | SIL Open Font License 1.1 | Google Fonts, vía Fontsource |
| JetBrains Mono | JetBrains | SIL Open Font License 1.1 | Google Fonts, vía Fontsource |

Las fuentes se alojan en el propio sitio (sin peticiones a Google).

## Software

| Biblioteca | Uso | Licencia |
|---|---|---|
| [Astro](https://astro.build) | Generador del sitio | MIT |
| [Three.js](https://threejs.org) | Escena 3D | MIT |
| [GSAP](https://gsap.com) + ScrollTrigger | Animación guiada por scroll | Licencia estándar de GSAP (uso gratuito) |
| [Lenis](https://lenis.darkroom.engineering) | Scroll suave | MIT |
| [Satori](https://github.com/vercel/satori) | Imágenes Open Graph | MPL-2.0 |
| [resvg-js](https://github.com/yisibl/resvg-js) | Rasterizado de imágenes OG | MPL-2.0 |
| [sharp](https://sharp.pixelplumbing.com) | Conversión de imágenes | Apache-2.0 |
| [opentype.js](https://opentype.js.org) | Conversión del logotipo a trazos | MIT |
| [Fontsource](https://fontsource.org) | Paquetes de fuentes | MIT (paquetes) / OFL (fuentes) |
| [GoatCounter](https://www.goatcounter.com) `count.js` | Analítica sin cookies (alojado en `public/vendor/`) | ISC |
| [Playwright](https://playwright.dev) | Generación de piezas de marca (solo en desarrollo) | Apache-2.0 |
