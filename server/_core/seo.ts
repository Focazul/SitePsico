/**
 * SEO Module - Fase 6.6
 * Gerencia sitemap, robots.txt e utilitários de SEO
 */

const BASE_URL = process.env.VITE_FRONTEND_URL || "http://localhost:5173";
const SITE_NAME = "Consultório de Psicologia";

interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

/**
 * Gera sitemap XML para SEO
 * Inclui páginas estáticas e posts de blog
 */
export async function generateSitemap(): Promise<string> {
  const entries: SitemapEntry[] = [
    // Páginas estáticas com alta prioridade
    {
      url: BASE_URL,
      changefreq: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      changefreq: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/services`,
      changefreq: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog`,
      changefreq: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact`,
      changefreq: "never",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/booking`,
      changefreq: "weekly",
      priority: 0.9,
    },
  ];

  // Gerar URLs para posts de blog (placeholder)
  const blogPosts = [
    "o-que-e-psicoterapia",
    "como-saber-se-preciso-de-terapia",
    "o-que-esperar-da-primeira-sessao",
    "diferenca-entre-profissionais",
    "terapia-online-beneficios",
    "como-escolher-um-psicologo",
    "ansiedade-sinais-e-quando-buscar-ajuda",
    "saude-mental-no-trabalho",
  ];

  blogPosts.forEach((slug) => {
    entries.push({
      url: `${BASE_URL}/blog/${slug}`,
      changefreq: "monthly",
      priority: 0.7,
    });
  });

  // Construir XML
  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
`;

  const xmlEntries = entries
    .map((entry) => {
      return `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    ${entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>\n` : ""}    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
    })
    .join("\n");

  const xmlFooter = `
</urlset>`;

  return xmlHeader + xmlEntries + xmlFooter;
}

/**
 * Gera robots.txt otimizado
 */
export function generateRobotsTxt(): string {
  return `# Robots.txt - Consultório de Psicologia
# Gerado automaticamente - Fase 6.6 SEO

# Google
User-agent: Googlebot
Allow: /
Crawl-delay: 1

# Bing
User-agent: Bingbot
Allow: /
Crawl-delay: 2

# Padrão para todos os bots
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /login
Disallow: /api/
Disallow: /.env
Crawl-delay: 2

# Sitemap
Sitemap: ${BASE_URL}/sitemap.xml

# Crawl-delay e request-rate
Request-rate: 30/60 (requests per 60 seconds)

# Comentários
# Este arquivo otimiza a indexação do site no Google e outros mecanismos de busca
# Protege áreas administrativas de bots de crawling
`;
}

/**
 * Escape de caracteres especiais XML
 */
function escapeXml(str: string): string {
  const xmlChars: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  };

  return str.replace(/[&<>"']/g, (char) => xmlChars[char] || char);
}

/**
 * Tipos para Schema.org
 */
export interface SchemaOrgData {
  type: "LocalBusiness" | "Person" | "ProfessionalService" | "Article" | "FAQPage";
  [key: string]: any;
}

/**
 * Gera schema LocalBusiness (para o negócio/consultório)
 */
export function generateLocalBusinessSchema(config: {
  name: string;
  description: string;
  address: string;
  telephone: string;
  email: string;
  priceRange?: string;
}): SchemaOrgData {
  return {
    type: "LocalBusiness",
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${BASE_URL}/#organization`,
    name: config.name,
    description: config.description,
    url: BASE_URL,
    telephone: config.telephone,
    email: config.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: config.address,
      addressCountry: "BR",
    },
    priceRange: config.priceRange || "$$",
    areaServed: {
      "@type": "City",
      name: "São Paulo",
    },
    hasMap: `https://maps.google.com/?q=${encodeURIComponent(config.address)}`,
    sameAs: [
      "https://www.instagram.com/profile",
      "https://www.linkedin.com/in/profile",
    ],
  };
}

/**
 * Gera schema Person (para o profissional)
 */
export function generatePersonSchema(config: {
  name: string;
  description: string;
  crp: string;
  image?: string;
}): SchemaOrgData {
  return {
    type: "Person",
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${BASE_URL}/#person`,
    name: config.name,
    description: config.description,
    url: BASE_URL,
    image: config.image || `${BASE_URL}/placeholder-photo.jpg`,
    jobTitle: "Psicólogo",
    worksFor: {
      "@type": "LocalBusiness",
      "@id": `${BASE_URL}/#organization`,
    },
    knowsAbout: [
      "Psicoterapia",
      "Ansiedade",
      "Depressão",
      "Autoestima",
      "Relacionamentos",
      "Terapia Cognitivo-Comportamental",
    ],
    credential: [
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: `CRP-SP ${config.crp}`,
      },
    ],
  };
}

/**
 * Gera schema ProfessionalService
 */
export function generateProfessionalServiceSchema(config: {
  serviceName: string;
  description: string;
  provider: string;
  areaServed: string;
}): SchemaOrgData {
  return {
    type: "ProfessionalService",
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: config.serviceName,
    description: config.description,
    provider: {
      "@type": "Person",
      name: config.provider,
      url: BASE_URL,
    },
    areaServed: {
      "@type": "City",
      name: config.areaServed,
    },
    priceRange: "$$",
    url: `${BASE_URL}/services`,
    telephone: "+55 11 99999-9999",
  };
}

/**
 * Gera schema Article para posts de blog
 */
export function generateArticleSchema(config: {
  headline: string;
  description: string;
  imageUrl?: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  url: string;
}): SchemaOrgData {
  return {
    type: "Article",
    "@context": "https://schema.org",
    "@type": "Article",
    headline: config.headline,
    description: config.description,
    image: config.imageUrl || `${BASE_URL}/blog-placeholder.jpg`,
    datePublished: config.datePublished,
    dateModified: config.dateModified || config.datePublished,
    author: {
      "@type": "Person",
      name: config.author,
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": config.url,
    },
  };
}

/**
 * Gera schema FAQPage
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>): SchemaOrgData {
  return {
    type: "FAQPage",
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Meta tags padrão para o site
 */
export const DEFAULT_META_TAGS = {
  title: "Psicólogo em São Paulo | Terapia Online e Presencial",
  description:
    "Consultório de psicologia com atendimento presencial e online. Especialista em ansiedade, depressão, autoestima e desenvolvimento pessoal. CRP-SP.",
  keywords: [
    "psicólogo em São Paulo",
    "psicoterapia",
    "terapia online",
    "ansiedade",
    "depressão",
    "psicólogo presencial",
    "saúde mental",
    "consultório",
  ].join(", "),
  author: "Consultório de Psicologia",
  ogImage: `${BASE_URL}/og-image.jpg`,
  ogType: "website",
  twitterCard: "summary_large_image",
  locale: "pt_BR",
  canonicalUrl: BASE_URL,
};

/**
 * Constantes de mudança de frequência
 */
export const CHANGEFREQ = {
  ALWAYS: "always" as const,
  HOURLY: "hourly" as const,
  DAILY: "daily" as const,
  WEEKLY: "weekly" as const,
  MONTHLY: "monthly" as const,
  YEARLY: "yearly" as const,
  NEVER: "never" as const,
};
