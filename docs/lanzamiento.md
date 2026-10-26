# Lista de lanzamiento

## Hecho y verificado

- [x] Compilación sin errores (`npm run build`) y sin errores de tipos (`npm run check`).
- [x] 14 páginas sin enlaces internos rotos (`node scripts/check-links.mjs`).
- [x] Lighthouse (portada): Accesibilidad 100 · Buenas prácticas 100 · SEO 100.
- [x] CLS < 0,05 en móvil y escritorio. LCP en escritorio: 1,0 s.
- [x] Historia 3D probada en escritorio (1440 × 900) y en móvil (390 × 844).
- [x] Versión con «reducir movimiento»: láminas estáticas con el mismo texto.
- [x] Sin JavaScript o sin WebGL: misma versión estática.
- [x] Español e inglés con `hreflang`, URL canónicas, Open Graph y datos estructurados (Organization, WebSite, Service, SoftwareApplication, BreadcrumbList).
- [x] `sitemap.xml`, `robots.txt`, manifiesto web, favicons e iconos de app.
- [x] Política de privacidad y de cookies (el sitio no usa cookies).
- [x] Sin nombres de fundadores ni número de integrantes.
- [x] Sin menciones a productos aún no anunciables.
- [x] Despliegue automático a GitHub Pages en cada push a `main`.

## Pendiente antes del anuncio público

- [ ] Correo de contacto real en `src/config/site.config.ts` y `brand/datos.json` (después: `npm run brand:render`).
- [ ] ID de Formspree en `src/config/site.config.ts`.
- [ ] Código de GoatCounter en `src/config/site.config.ts`.
- [ ] Revisar con el equipo de producto los textos de Muévelo (`src/config/products.config.ts`).
- [ ] (Opcional) Dominio propio: ver README → «Dominio propio».
- [ ] (Opcional) Revisión legal de los textos de privacidad según la jurisdicción.

## Notas de rendimiento

La escena 3D se carga después del primer pintado, el terreno se calcula en un Web Worker y los shaders se compilan de forma
asíncrona. Las auditorías automáticas en servidores sin GPU (renderizado WebGL por software) sobrestiman el tiempo de
bloqueo; en equipos reales la GPU hace el trabajo. La calidad se adapta al dispositivo: menos partículas en móviles
y resolución reducida si los primeros fotogramas van lentos.

## Pruebas manuales recomendadas tras el despliegue

- Safari en iPhone y Chrome en Android: recorrer la historia completa con el dedo.
- Firefox y Safari de escritorio: recorrer la historia con rueda y con trackpad.
- Activar «reducir movimiento» en el sistema y recargar.
- Navegar solo con teclado (Tab) por cabecera, enlaces y formulario.
