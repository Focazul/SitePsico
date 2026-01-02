/**
 * NOTA: Google Analytics Provider temporariamente desabilitado
 * Causa problemas intermitentes com page rendering
 * 
 * GA4 será integrado através de:
 * 1. Script tag no index.html (quando admin configurar o ID)
 * 2. Tracking manual de eventos via analytics.ts
 * 3. Sem necessidade de componente React provider
 * 
 * Remova este arquivo após confirmar que não há referências
 */
export default function GoogleAnalyticsProvider() {
  return null;
}
