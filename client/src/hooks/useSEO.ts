/**
 * Hook useSEO - Gerencia meta tags no head
 * Fase 6.6 - SEO Avançado
 */

import { useEffect } from "react";

interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  author?: string;
  robots?: string;
  viewport?: string;
  charset?: string;
}

const DEFAULT_CONFIG: SEOConfig = {
  title: "Psicólogo em São Paulo | Terapia Online e Presencial",
  description:
    "Consultório de psicologia com atendimento presencial e online. Especialista em ansiedade, depressão, autoestima e desenvolvimento pessoal.",
  keywords:
    "psicólogo em São Paulo, psicoterapia, terapia online, ansiedade, depressão, saúde mental",
  ogType: "website",
  twitterCard: "summary_large_image",
  robots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  charset: "UTF-8",
  viewport: "width=device-width, initial-scale=1.0",
};

/**
 * Hook para gerenciar SEO e meta tags
 * Atualiza dinamicamente o head da página
 */
export function useSEO(config: SEOConfig = {}) {
  useEffect(() => {
    const merged = { ...DEFAULT_CONFIG, ...config };

    // Atualizar title
    if (merged.title) {
      document.title = merged.title;
      updateMetaTag("og:title", merged.ogTitle || merged.title);
      updateMetaTag("twitter:title", merged.twitterTitle || merged.title);
    }

    // Atualizar description
    if (merged.description) {
      updateMetaTag("description", merged.description);
      updateMetaTag("og:description", merged.ogDescription || merged.description);
      updateMetaTag(
        "twitter:description",
        merged.twitterDescription || merged.description,
      );
    }

    // Atualizar keywords
    if (merged.keywords) {
      updateMetaTag("keywords", merged.keywords);
    }

    // Atualizar Open Graph
    if (merged.ogUrl) {
      updateMetaTag("og:url", merged.ogUrl);
    }
    if (merged.ogImage) {
      updateMetaTag("og:image", merged.ogImage);
      updateMetaTag("twitter:image", merged.twitterImage || merged.ogImage);
    }
    if (merged.ogType) {
      updateMetaTag("og:type", merged.ogType);
    }

    // Atualizar Twitter Card
    if (merged.twitterCard) {
      updateMetaTag("twitter:card", merged.twitterCard);
    }

    // Atualizar Canonical URL
    if (merged.canonicalUrl) {
      updateCanonicalTag(merged.canonicalUrl);
    }

    // Atualizar author
    if (merged.author) {
      updateMetaTag("author", merged.author);
    }

    // Atualizar robots
    if (merged.robots) {
      updateMetaTag("robots", merged.robots);
    }

    // Cleanup não é necessário pois estamos apenas atualizando meta tags existentes
  }, [config]);
}

/**
 * Atualiza ou cria uma meta tag
 */
function updateMetaTag(name: string, content: string) {
  let element = document.querySelector(`meta[name="${name}"]`) ||
    document.querySelector(`meta[property="${name}"]`);

  if (!element) {
    element = document.createElement("meta");
    // Determine if it's a property or name attribute
    if (name.startsWith("og:") || name.startsWith("twitter:")) {
      element.setAttribute("property", name);
    } else {
      element.setAttribute("name", name);
    }
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

/**
 * Atualiza ou cria a tag canonical
 */
function updateCanonicalTag(url: string) {
  let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement;

  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }

  canonical.href = url;
}

/**
 * Gera URL com trailing slash removido (melhor para SEO)
 */
export function normalizeUrl(url: string): string {
  if (url === "/") return url;
  return url.replace(/\/$/, "");
}

/**
 * Composição de título SEO
 */
export function composeTitle(pageName: string, siteName: string = "Psicólogo SP"): string {
  if (pageName === "home") {
    return "Psicólogo em São Paulo | Terapia Online e Presencial";
  }
  return `${pageName} | ${siteName}`;
}

/**
 * Gera descrição meta padrão por tipo de página
 */
export function getPageDescription(pageType: "home" | "about" | "services" | "blog" | "contact"): string {
  const descriptions = {
    home: "Consultório de psicologia com atendimento presencial e online em São Paulo. Especialista em ansiedade, depressão, autoestima e desenvolvimento pessoal. CRP-SP.",
    about: "Conheça mais sobre o consultório, formação profissional, especialidades e abordagens terapêuticas. Atendimento humanizado e ético.",
    services: "Conheça as modalidades e áreas de atuação. Atendimento presencial e online com flexibilidade de horários.",
    blog: "Artigos sobre saúde mental, psicologia e desenvolvimento pessoal. Conteúdo educativo e informativo.",
    contact: "Entre em contato conosco. Agende sua consulta, tire dúvidas ou envie uma mensagem. Resposta rápida garantida.",
  };

  return descriptions[pageType] || "";
}

/**
 * Hook helper para páginas simples
 */
export function usePageSEO(
  pageName: string,
  pageType: "home" | "about" | "services" | "blog" | "contact",
  ogImage?: string,
) {
  const title = composeTitle(pageName);
  const description = getPageDescription(pageType);
  const canonicalUrl = `${window.location.origin}${normalizeUrl(window.location.pathname)}`;

  useSEO({
    title,
    description,
    ogImage,
    ogUrl: canonicalUrl,
    canonicalUrl,
  });
}
