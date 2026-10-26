# Ápice · sitio corporativo y sistema de marca

Sitio web de **Ápice** (software y ciencia de datos con rigor científico) y todas sus piezas de marca.

- **Sitio publicado:** https://pol4720.github.io/PMP-Enterprise/
- **Manual de marca (Brand Guidelines):** https://pol4720.github.io/PMP-Enterprise/marca/
- **Idiomas:** español (principal) en `/` e inglés en `/en/`.

---

## Antes de lanzar: datos pendientes

El sitio funciona y se puede publicar ya. Estos tres valores están marcados como `PENDIENTE` en
[`src/config/site.config.ts`](src/config/site.config.ts). Mientras falten, el sitio muestra un aviso en lugar del correo,
el formulario aparece desactivado y la analítica no se carga.

| Dato | Dónde | Cómo conseguirlo |
|---|---|---|
| Correo de contacto | `contactEmail` y `brand/datos.json` → `correo` | El correo público de la empresa (sugerido: `contacto@<tu-dominio>`). |
| Formulario | `formspreeId` | Crea una cuenta gratuita en [formspree.io](https://formspree.io), crea un formulario con ese correo y copia su ID (lo que va después de `/f/`). |
| Analítica | `goatcounterCode` | Crea una cuenta gratuita en [goatcounter.com](https://www.goatcounter.com) y copia tu código (lo que va antes de `.goatcounter.com`). |

Tras cambiar el correo en `brand/datos.json`, regenera las tarjetas y la firma con `npm run brand:render`.

---

## Comandos

```bash
npm install          # instalar dependencias (Node 20 o superior)
npm run dev          # servidor local en http://localhost:4321/PMP-Enterprise/
npm run build        # compilar el sitio en dist/
npm run preview      # ver la versión compilada
npm run check        # comprobar tipos y errores
npm run brand:build  # regenerar los SVG del logo (desde la tipografía)
npm run brand:render # regenerar PNG, favicons, tarjetas, firma, plantillas y redes (necesita Playwright)
npm run story:stills # regenerar las láminas estáticas de la historia (con `npm run preview` en marcha)
```

---

## Cómo añadir un producto

1. Abre [`src/config/products.config.ts`](src/config/products.config.ts).
2. Copia el bloque de `muevelo` y pégalo a continuación dentro de la lista.
3. Cambia:
   - `slug`: identificador para la URL (minúsculas, sin tildes ni espacios), p. ej. `mi-producto`.
   - `name`: nombre visible.
   - `status`: `'available'` (Disponible), `'soon'` (Próximamente) o `'collab'` (En colaboración).
   - `accent`: color propio del producto en HEX.
   - `url`: el sitio del producto cuando exista (opcional).
   - `partners`: instituciones colaboradoras, **solo con permiso para nombrarlas** (opcional).
   - Los textos `es` y `en`: sector, frase corta, descripción y de 3 a 5 capacidades.
4. Guarda y publica (ver «Cómo desplegar»).

El producto aparece automáticamente en la portada (tarjetas del ecosistema), en la **escena 3D** (como una cumbre nueva
de la cordillera), en el pie de página, en su propia página (`/productos/<slug>/` y `/en/products/<slug>/`), en el
`sitemap.xml`, en los datos estructurados y con su propia imagen para redes sociales.

Para ocultarlo temporalmente sin borrarlo, añade `hidden: true`.

## Cómo añadir o cambiar un servicio

Edita [`src/config/services.config.ts`](src/config/services.config.ts). Cada servicio tiene un icono (`advisory`, `statistics`, `ml`,
`ai`, `analytics`, `custom`), título, resumen y casos de uso en español e inglés.

## Cómo editar un texto

Todos los textos del sitio están separados del diseño:

| Qué | Archivo |
|---|---|
| Textos generales (portada, historia, secciones, formulario, pie) | [`src/i18n/es.ts`](src/i18n/es.ts) y [`src/i18n/en.ts`](src/i18n/en.ts) |
| Política de privacidad y de cookies | [`src/i18n/legal.ts`](src/i18n/legal.ts) |
| Productos | [`src/config/products.config.ts`](src/config/products.config.ts) |
| Servicios | [`src/config/services.config.ts`](src/config/services.config.ts) |
| Correo, formulario, analítica, redes | [`src/config/site.config.ts`](src/config/site.config.ts) |

Busca el texto que quieres cambiar, edítalo entre las comillas y guarda. Cambia siempre también su par en el otro idioma.
GitHub permite editar archivos desde el navegador: abre el archivo, pulsa el lápiz, edita y confirma con «Commit changes»;
el sitio se publica solo en un par de minutos.

## Cómo cambiar colores, tipografías o espaciados

Todo el sistema visual está en un único archivo: [`src/design/tokens.ts`](src/design/tokens.ts). El sitio y el manual de
marca leen de ahí; un cambio se refleja en todas partes.

---

## Cómo desplegar

### GitHub Pages (configuración actual)

El despliegue es automático: cada `push` a `main` ejecuta el flujo
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), que comprueba, compila y publica el sitio.

Requisito (una sola vez): en GitHub → *Settings* → *Pages* → *Build and deployment* → *Source*: **GitHub Actions**.

Puedes seguir cada publicación en la pestaña *Actions* del repositorio.

### Dominio propio

1. Compra el dominio (sugerencias libres en la fase de naming: `apicedata.com`, `apice.io`).
2. En [`deploy.config.mjs`](deploy.config.mjs) cambia `site` por tu dominio (p. ej. `'https://apicedata.com'`) y `base` por `'/'`.
3. Crea el archivo `public/CNAME` con el dominio en una sola línea (p. ej. `apicedata.com`).
4. En tu proveedor de dominio, apunta los registros DNS a GitHub Pages
   ([guía oficial](https://docs.github.com/es/pages/configuring-a-custom-domain-for-your-github-pages-site)).
5. En *Settings* → *Pages*, escribe el dominio y activa *Enforce HTTPS*.

### Otros proveedores (Netlify, Vercel, Cloudflare Pages)

Comando de compilación `npm run build`, carpeta de salida `dist`. Define `BASE_PATH=/` y `SITE_URL=https://tu-dominio`
como variables de entorno.

---

## Estructura del repositorio

```
├── src/
│   ├── config/          # Contenido editable: site, products, services
│   ├── i18n/            # Textos ES/EN y textos legales
│   ├── design/tokens.ts # Sistema de diseño (colores, tipos, espacios, movimiento)
│   ├── components/      # Componentes reutilizables (Logo, Icon, Topo, Header, Footer, secciones…)
│   ├── scene/           # Escena 3D de la historia (Three.js + shaders + worker del terreno)
│   ├── lib/             # Lógica: scroll, historia, emblemas topográficos, imágenes OG
│   ├── layouts/ views/  # Plantillas de página
│   └── pages/           # Rutas: portada, productos, legales, marca, sitemap, OG, 404
├── brand/               # Fuentes de la marca: logos SVG y datos de tarjetas/firma
├── scripts/             # Generadores: logos, piezas de marca, láminas, comprobador de enlaces
├── public/              # Archivos servidos tal cual: favicons, piezas de marca, láminas
├── docs/                # Estrategia, decisiones y lista de lanzamiento
├── ATTRIBUTIONS.md      # Origen y licencia de cada recurso
└── deploy.config.mjs    # Dominio y ruta base
```

## Decisiones técnicas

- **Astro + TypeScript:** genera HTML estático (rápido, seguro, ideal para GitHub Pages), envía JavaScript solo donde
  hace falta y trae multilenguaje de serie.
- **CSS con tokens en lugar de Tailwind:** el diseño es muy específico; las variables CSS generadas desde
  `tokens.ts` mantienen una única fuente de verdad sin añadir otra herramienta.
- **Three.js + shaders propios** para la historia: 20 000–110 000 partículas y curvas de nivel calculadas en la GPU.
  El terreno se genera en un *Web Worker* para no bloquear la página. **GSAP ScrollTrigger + Lenis** sincronizan
  la escena con el scroll.
- **Accesibilidad:** con «reducir movimiento» activado, sin JavaScript o sin WebGL, la historia se muestra como seis
  láminas estáticas con el mismo texto. Contraste WCAG AA verificado.
- **Privacidad:** sin cookies; fuentes y analítica alojadas en el propio sitio.

Más detalle en [`docs/`](docs/).
