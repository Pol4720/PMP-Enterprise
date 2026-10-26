/**
 * Servicios a medida. Añadir un servicio = añadir una entrada.
 * `icon` es el nombre de un icono de src/components/Icon.astro.
 */
type ServiceCopy = {
  title: string;
  summary: string;
  /** Casos de uso concretos: ejemplos de lo que hacemos, no clientes. */
  useCases: string[];
};

export type Service = {
  id: string;
  icon: 'advisory' | 'statistics' | 'ml' | 'ai' | 'analytics' | 'custom';
  es: ServiceCopy;
  en: ServiceCopy;
};

export const services: Service[] = [
  {
    id: 'asesoria',
    icon: 'advisory',
    es: {
      title: 'Asesoría y análisis de datos',
      summary: 'Te ayudamos a saber qué datos tienes, qué preguntas pueden responder y qué decisiones conviene tomar con ellos.',
      useCases: ['Diagnóstico de madurez de datos', 'Auditoría de calidad y limpieza de bases de datos', 'Hoja de ruta de datos e IA para tu organización'],
    },
    en: {
      title: 'Data advisory and analysis',
      summary: 'We help you understand what data you have, which questions it can answer and which decisions it should drive.',
      useCases: ['Data maturity assessment', 'Database quality audit and cleaning', 'Data and AI roadmap for your organisation'],
    },
  },
  {
    id: 'estadistica',
    icon: 'statistics',
    es: {
      title: 'Estadística aplicada',
      summary: 'Diseño de estudios, inferencia y modelos estadísticos con resultados que se pueden defender ante cualquier revisor.',
      useCases: ['Diseño de muestreos y encuestas', 'Pruebas A/B y diseño de experimentos', 'Análisis de supervivencia y series temporales'],
    },
    en: {
      title: 'Applied statistics',
      summary: 'Study design, inference and statistical models with results you can defend in front of any reviewer.',
      useCases: ['Sampling and survey design', 'A/B testing and experimental design', 'Survival and time-series analysis'],
    },
  },
  {
    id: 'aprendizaje-automatico',
    icon: 'ml',
    es: {
      title: 'Aprendizaje automático',
      summary: 'Modelos predictivos entrenados, validados y puestos en producción, con métricas claras de cuánto aciertan.',
      useCases: ['Predicción de demanda e inventario', 'Detección de anomalías y fraude', 'Segmentación de clientes y recomendación'],
    },
    en: {
      title: 'Machine learning',
      summary: 'Predictive models trained, validated and deployed, with clear metrics on how often they are right.',
      useCases: ['Demand and inventory forecasting', 'Anomaly and fraud detection', 'Customer segmentation and recommendation'],
    },
  },
  {
    id: 'inteligencia-artificial',
    icon: 'ai',
    es: {
      title: 'Inteligencia artificial',
      summary: 'Lenguaje natural, visión por computadora y asistentes inteligentes integrados en tus procesos, con control y trazabilidad.',
      useCases: ['Clasificación y extracción de información de documentos', 'Asistentes conversacionales sobre tu propia documentación', 'Inspección visual automatizada'],
    },
    en: {
      title: 'Artificial intelligence',
      summary: 'Natural language, computer vision and intelligent assistants built into your processes, with control and traceability.',
      useCases: ['Document classification and information extraction', 'Conversational assistants over your own documentation', 'Automated visual inspection'],
    },
  },
  {
    id: 'analitica',
    icon: 'analytics',
    es: {
      title: 'Analítica e inteligencia de negocio',
      summary: 'Indicadores y paneles que muestran lo importante, conectados a tus fuentes y actualizados sin trabajo manual.',
      useCases: ['Paneles de indicadores para dirección', 'Integración de fuentes dispersas en un solo almacén', 'Informes automáticos periódicos'],
    },
    en: {
      title: 'Analytics and business intelligence',
      summary: 'Indicators and dashboards that show what matters, connected to your sources and updated without manual work.',
      useCases: ['KPI dashboards for leadership', 'Unifying scattered sources into one warehouse', 'Automated recurring reports'],
    },
  },
  {
    id: 'soluciones-a-medida',
    icon: 'custom',
    es: {
      title: 'Soluciones a medida',
      summary: 'Cuando ninguna herramienta existente encaja, diseñamos y construimos el software exacto que tu problema necesita.',
      useCases: ['Plataformas web y móviles con datos en el centro', 'Automatización de procesos internos', 'Integración de modelos en sistemas existentes'],
    },
    en: {
      title: 'Custom solutions',
      summary: 'When no existing tool fits, we design and build exactly the software your problem needs.',
      useCases: ['Data-centred web and mobile platforms', 'Internal process automation', 'Integrating models into existing systems'],
    },
  },
];
