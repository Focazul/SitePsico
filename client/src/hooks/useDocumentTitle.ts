import { useEffect } from 'react';
import { useSiteConfig } from './useSiteConfig';

/**
 * Hook para atualizar dinamicamente o título do documento
 * @param pageTitle - Título específico da página (opcional)
 */
export function useDocumentTitle(pageTitle?: string) {
  const { config } = useSiteConfig();

  useEffect(() => {
    const baseTitle = config.siteTitle || 'Site Profissional - Psicólogo SP';
    
    if (pageTitle) {
      document.title = `${pageTitle} | ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }

    // Atualizar meta description se disponível
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && config.siteDescription) {
      metaDescription.setAttribute('content', config.siteDescription);
    }
  }, [pageTitle, config.siteTitle, config.siteDescription]);
}
