/**
 * Catálogo de productos.
 *
 * Añadir un producto = añadir una entrada a esta lista. Aparece automáticamente en:
 * la escena 3D de la portada (como una nueva cumbre de la cordillera), las tarjetas
 * del ecosistema, el menú, su propia página, el sitemap, los datos estructurados
 * y su imagen para redes sociales (Open Graph).
 *
 * Estados disponibles:
 *  - 'available' → «Disponible»: ya se puede usar (añade `url`).
 *  - 'soon'      → «Próximamente»: en desarrollo.
 *  - 'collab'    → «En colaboración»: desarrollado junto a otra institución (añade `partners`).
 */
export type ProductStatus = 'available' | 'soon' | 'collab';

type ProductCopy = {
  /** Frase corta (máx. ~70 caracteres). */
  tagline: string;
  /** Uno o dos párrafos. */
  description: string;
  /** 3 a 5 capacidades clave. */
  features: { title: string; text: string }[];
  /** Sector o categoría, en una o dos palabras. */
  sector: string;
};

export type Product = {
  /** Identificador para la URL: minúsculas, sin espacios ni tildes. */
  slug: string;
  name: string;
  status: ProductStatus;
  /** Color de acento propio del producto (submarca). */
  accent: string;
  /** Sitio independiente del producto, cuando exista. */
  url?: string;
  /** Instituciones colaboradoras (solo con permiso para nombrarlas). */
  partners?: string[];
  /** Ocultar temporalmente sin borrar la entrada. */
  hidden?: boolean;
  es: ProductCopy;
  en: ProductCopy;
};

export const products: Product[] = [
  {
    slug: 'muevelo',
    name: 'Muévelo',
    status: 'soon',
    accent: '#E07A3F',
    es: {
      sector: 'Logística',
      tagline: 'La forma más directa de mover mercancía.',
      description:
        'Muévelo conecta a quienes necesitan trasladar mercancía con conductores disponibles, a través de aplicaciones móviles para cada parte. Publicas lo que hay que mover, eliges a quién te lo lleva y sigues el trayecto hasta la entrega.',
      features: [
        { title: 'Dos aplicaciones, un mismo flujo', text: 'Una app para quien envía y otra para quien conduce, sincronizadas en tiempo real.' },
        { title: 'Asignación inteligente', text: 'Sugiere los conductores más adecuados según distancia, capacidad del vehículo y disponibilidad.' },
        { title: 'Seguimiento del envío', text: 'Estado del traslado de principio a fin, con avisos en cada etapa.' },
        { title: 'Historial y valoraciones', text: 'Cada servicio queda registrado y valorado para construir confianza entre ambas partes.' },
      ],
    },
    en: {
      sector: 'Logistics',
      tagline: 'The most direct way to move goods.',
      description:
        'Muévelo connects people who need to move goods with available drivers, through a mobile app for each side. Post what needs moving, choose who carries it and follow the trip until delivery.',
      features: [
        { title: 'Two apps, one flow', text: 'One app for senders and another for drivers, synchronised in real time.' },
        { title: 'Smart matching', text: 'Suggests the best-suited drivers by distance, vehicle capacity and availability.' },
        { title: 'Shipment tracking', text: 'End-to-end trip status, with notifications at every stage.' },
        { title: 'History and ratings', text: 'Every job is logged and rated, building trust on both sides.' },
      ],
    },
  },
];

export const visibleProducts = products.filter((p) => !p.hidden);
