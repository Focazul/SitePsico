import { useEffect } from 'react';

/**
 * Hook que carrega configuração GA4 do backend e injeta no window
 * para que o script tag inicial (no index.html) possa acessar
 */
export function useGA4Config() {
  useEffect(() => {
    // Carregar configuração GA4 do backend
    const loadGA4Config = async () => {
      try {
        // Simular chamada ao backend para pegar configurações
        // Em produção, isso viria de um endpoint tRPC
        const response = await fetch('/api/trpc/settings.getGA4Config');
        
        if (response.ok) {
          const data = await response.json();
          const config = data.result?.data;
          
          if (config && config.measurement_id) {
            // Armazenar no window para script tag acessar
            (window as any).__GA_CONFIG__ = {
              measurement_id: config.measurement_id,
              enabled: config.enabled !== false
            };
            
            console.log('✅ GA4 Config loaded:', config.measurement_id);
          }
        } else {
          console.warn('⚠️ GA4 config endpoint not available');
        }
      } catch (error) {
        console.error('❌ Error loading GA4 config:', error);
      }
    };
    
    loadGA4Config();
  }, []);

  return {
    /**
     * Função utilitária para rastrear eventos manualmente
     * Usa gtag global se disponível
     */
    trackEvent: (eventName: string, eventData?: Record<string, any>) => {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', eventName, eventData);
      } else {
        console.debug('GA4 not loaded yet, event skipped:', eventName);
      }
    }
  };
}
