import { trpc } from "@/lib/trpc";

/**
 * Interface para configurações do site
 */
export interface SiteConfig {
  // Informações do psicólogo
  psychologistName: string;
  psychologistCrp: string;
  
  // Contato
  email: string;
  phone: string;
  whatsappNumber: string;
  address: string;
  
  // Redes sociais
  instagramUrl: string;
  linkedinUrl: string;
  website: string;
  
  // Conteúdo
  aboutText: string;
  servicesText: string;
  consultationPrice: string;
  openingHours: string;

  // Sessao
  sessionDuration: string;
  availability?: Array<{ day?: string; enabled?: boolean; start?: string; end?: string }>;
  
  // Meta
  siteTitle: string;
  siteDescription: string;
}

/**
 * Hook para obter configurações públicas do site
 * Busca dados salvos no painel admin
 */
export function useSiteConfig() {
  const { data: settings, isLoading, error } = trpc.settings.getPublic.useQuery();

  const config: SiteConfig = {
    // Informações do psicólogo
    psychologistName: settings?.find((s) => s.key === "psychologist_name")?.value ?? "Psicólogo(a)",
    psychologistCrp: settings?.find((s) => s.key === "psychologist_crp")?.value ?? "CRP 06/000000",
    
    // Contato
    email: settings?.find((s) => s.key === "email")?.value ?? "contato@exemplo.com",
    phone: settings?.find((s) => s.key === "phone")?.value ?? "(11) 99999-9999",
    whatsappNumber: settings?.find((s) => s.key === "whatsapp_number")?.value ?? "5511999999999",
    address: settings?.find((s) => s.key === "address")?.value ?? "Endereço não informado",
    
    // Redes sociais
    instagramUrl: settings?.find((s) => s.key === "instagram_url")?.value ?? "",
    linkedinUrl: settings?.find((s) => s.key === "linkedin_url")?.value ?? "",
    website: settings?.find((s) => s.key === "website")?.value ?? "",
    
    // Conteúdo
    aboutText: settings?.find((s) => s.key === "about_text")?.value ?? "",
    servicesText: settings?.find((s) => s.key === "services_text")?.value ?? "",
    consultationPrice: settings?.find((s) => s.key === "consultation_price")?.value ?? "R$ 200,00",
    openingHours: settings?.find((s) => s.key === "opening_hours")?.value ?? "Segunda a Sexta: 09h - 18h",
    sessionDuration: settings?.find((s) => s.key === "session_duration")?.value ?? "50",
    availability: (() => {
      const raw = settings?.find((s) => s.key === "availability")?.value;
      if (!raw) return undefined;
      try {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        return Array.isArray(parsed) ? parsed : undefined;
      } catch {
        return undefined;
      }
    })(),
    
    // Meta
    siteTitle: settings?.find((s) => s.key === "site_title")?.value ?? "Consultório de Psicologia",
    siteDescription: settings?.find((s) => s.key === "site_description")?.value ?? "Atendimento psicológico humanizado",
  };

  return {
    config,
    isLoading,
    error,
  };
}

/**
 * Hook helper para obter valor específico
 */
export function useSetting(key: string, defaultValue: string = "") {
  const { config, isLoading } = useSiteConfig();
  
  // Map das chaves para as propriedades do config
  const keyMap: Record<string, keyof SiteConfig> = {
    psychologist_name: "psychologistName",
    psychologist_crp: "psychologistCrp",
    email: "email",
    phone: "phone",
    whatsapp_number: "whatsappNumber",
    address: "address",
    instagram_url: "instagramUrl",
    linkedin_url: "linkedinUrl",
    website: "website",
    about_text: "aboutText",
    services_text: "servicesText",
    consultation_price: "consultationPrice",
    opening_hours: "openingHours",
    session_duration: "sessionDuration",
    site_title: "siteTitle",
    site_description: "siteDescription",
  };

  const mappedKey = keyMap[key];
  const value = mappedKey ? config[mappedKey] : defaultValue;

  return {
    value,
    isLoading,
  };
}
