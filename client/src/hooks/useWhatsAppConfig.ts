import { trpc } from "@/lib/trpc";

interface WhatsAppConfig {
  enabled: boolean;
  phoneNumber: string;
  defaultMessage: string;
}

/**
 * Hook para obter configurações do WhatsApp do banco de dados
 */
export function useWhatsAppConfig() {
  const { data: settings, isLoading } = trpc.settings.getPublic.useQuery();

  const config: WhatsAppConfig = {
    enabled: settings?.find((s) => s.key === "whatsapp_button_enabled")?.value !== "false",
    phoneNumber: settings?.find((s) => s.key === "whatsapp_number")?.value ?? "5511999999999",
    defaultMessage: settings?.find((s) => s.key === "whatsapp_default_message")?.value ?? "Olá! Gostaria de saber mais sobre os atendimentos.",
  };

  return {
    config,
    isLoading,
  };
}

/**
 * Gera link do WhatsApp com mensagem customizada
 */
export function getWhatsAppLink(phoneNumber: string, message: string): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}

/**
 * Formata número de telefone para exibição
 * Exemplo: 5511999999999 → +55 (11) 99999-9999
 */
export function formatPhoneNumber(phone: string): string {
  // Remove qualquer caractere que não seja número
  const cleaned = phone.replace(/\D/g, '');
  
  // Verifica se tem DDI (55 para Brasil)
  if (cleaned.length === 13 && cleaned.startsWith('55')) {
    const ddi = cleaned.substring(0, 2);
    const ddd = cleaned.substring(2, 4);
    const firstPart = cleaned.substring(4, 9);
    const secondPart = cleaned.substring(9, 13);
    return `+${ddi} (${ddd}) ${firstPart}-${secondPart}`;
  }
  
  // Se não tiver DDI, formata apenas com DDD
  if (cleaned.length === 11) {
    const ddd = cleaned.substring(0, 2);
    const firstPart = cleaned.substring(2, 7);
    const secondPart = cleaned.substring(7, 11);
    return `(${ddd}) ${firstPart}-${secondPart}`;
  }
  
  // Retorna original se não conseguir formatar
  return phone;
}
