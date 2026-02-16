/**
 * Google Analytics 4 Integration
 * 
 * Gerencia tracking de eventos e pageviews com GA4
 * Carrega script apenas quando GA_MEASUREMENT_ID está configurado
 */

// Declaração de tipos para gtag
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

let isInitialized = false;
let measurementId: string | null = null;

/**
 * Inicializa Google Analytics 4
 */
export function initializeGA(gaMeasurementId: string) {
  if (isInitialized || !gaMeasurementId || typeof window === 'undefined') {
    return;
  }

  measurementId = gaMeasurementId;

  // Criar dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer!.push(arguments);
  };

  // Inicializar com timestamp
  window.gtag('js', new Date());

  // Configurar GA4
  window.gtag('config', measurementId, {
    send_page_view: false, // Controlaremos manualmente
    anonymize_ip: true, // LGPD compliance
  });

  // Carregar script do Google Analytics
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  isInitialized = true;
  console.log('[Analytics] Google Analytics 4 initialized:', measurementId);
}

/**
 * Verifica se GA está inicializado
 */
export function isGAInitialized(): boolean {
  return isInitialized && !!window.gtag;
}

/**
 * Envia pageview para GA4
 */
export function trackPageView(path: string, title?: string) {
  if (!isGAInitialized()) return;

  window.gtag!('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href,
  });

  console.log('[Analytics] Page view tracked:', path);
}

/**
 * Evento: Clique em CTA
 */
export function trackCTAClick(ctaName: string, location: string) {
  if (!isGAInitialized()) return;

  window.gtag!('event', 'cta_click', {
    cta_name: ctaName,
    cta_location: location,
  });

  console.log('[Analytics] CTA click tracked:', ctaName);
}

/**
 * Evento: Submissão de formulário
 */
export function trackFormSubmission(formName: string, formType: 'contact' | 'booking' | 'other') {
  if (!isGAInitialized()) return;

  window.gtag!('event', 'form_submission', {
    form_name: formName,
    form_type: formType,
  });

  console.log('[Analytics] Form submission tracked:', formName);
}

/**
 * Evento: Agendamento completado
 */
export function trackAppointmentCompleted(modality: 'presencial' | 'online') {
  if (!isGAInitialized()) return;

  window.gtag!('event', 'appointment_completed', {
    modality,
    value: 1, // Conversão
  });

  // Também rastrear como conversão
  window.gtag!('event', 'conversion', {
    send_to: measurementId,
    value: 1,
    currency: 'BRL',
  });

  console.log('[Analytics] Appointment completed tracked:', modality);
}

/**
 * Evento: Clique em link externo
 */
export function trackOutboundLink(url: string, linkText: string) {
  if (!isGAInitialized()) return;

  window.gtag!('event', 'click', {
    event_category: 'outbound',
    event_label: url,
    link_text: linkText,
  });

  console.log('[Analytics] Outbound link tracked:', url);
}

/**
 * Evento: Clique no WhatsApp
 */
export function trackWhatsAppClick(location: string) {
  if (!isGAInitialized()) return;

  window.gtag!('event', 'whatsapp_click', {
    location,
  });

  console.log('[Analytics] WhatsApp click tracked');
}

/**
 * Evento: Compartilhamento social
 */
export function trackSocialShare(platform: 'whatsapp' | 'linkedin' | 'copy', contentType: string, contentTitle: string) {
  if (!isGAInitialized()) return;

  window.gtag!('event', 'share', {
    method: platform,
    content_type: contentType,
    content_id: contentTitle,
  });

  console.log('[Analytics] Social share tracked:', platform, contentTitle);
}

/**
 * Evento: Visualização de artigo do blog
 */
export function trackBlogPostView(postSlug: string, postTitle: string, category: string) {
  if (!isGAInitialized()) return;

  window.gtag!('event', 'blog_post_view', {
    post_slug: postSlug,
    post_title: postTitle,
    post_category: category,
  });

  console.log('[Analytics] Blog post view tracked:', postTitle);
}

/**
 * Evento: Busca no site
 */
export function trackSearch(searchTerm: string, resultsCount: number) {
  if (!isGAInitialized()) return;

  window.gtag!('event', 'search', {
    search_term: searchTerm,
    results_count: resultsCount,
  });

  console.log('[Analytics] Search tracked:', searchTerm);
}

/**
 * Evento: Scroll profundo (50%, 75%, 90%)
 */
export function trackScroll(percentage: number, pagePath: string) {
  if (!isGAInitialized()) return;

  window.gtag!('event', 'scroll', {
    percent_scrolled: percentage,
    page_path: pagePath,
  });

  console.log('[Analytics] Scroll tracked:', `${percentage  }%`);
}

/**
 * Evento: Tempo de leitura (para blog posts)
 */
export function trackReadingTime(postSlug: string, timeInSeconds: number) {
  if (!isGAInitialized()) return;

  window.gtag!('event', 'reading_time', {
    post_slug: postSlug,
    time_seconds: timeInSeconds,
    time_category: timeInSeconds < 30 ? 'quick' : timeInSeconds < 120 ? 'medium' : 'deep',
  });

  console.log('[Analytics] Reading time tracked:', `${timeInSeconds  }s`);
}

/**
 * Evento customizado genérico
 */
export function trackCustomEvent(eventName: string, params?: Record<string, any>) {
  if (!isGAInitialized()) return;

  window.gtag!('event', eventName, params);

  console.log('[Analytics] Custom event tracked:', eventName, params);
}

/**
 * Define propriedades do usuário
 */
export function setUserProperties(properties: Record<string, any>) {
  if (!isGAInitialized()) return;

  window.gtag!('set', 'user_properties', properties);

  console.log('[Analytics] User properties set:', properties);
}
