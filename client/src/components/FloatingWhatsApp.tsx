import { MessageCircle } from "lucide-react";
import { useWhatsAppConfig, getWhatsAppLink } from "@/hooks/useWhatsAppConfig";
import { trackWhatsAppClick } from "@/lib/analytics";

/**
 * Botão flutuante de WhatsApp configurável via admin
 * Aparece em todas as páginas (exceto se desabilitado)
 */
export default function FloatingWhatsApp() {
  const { config, isLoading } = useWhatsAppConfig();

  // Não renderiza se desabilitado ou ainda carregando
  if (isLoading || !config.enabled) {
    return null;
  }

  const whatsappLink = getWhatsAppLink(config.phoneNumber, config.defaultMessage);

  const handleClick = () => {
    trackWhatsAppClick("floating_button");
  };

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noreferrer"
      aria-label="Fale conosco pelo WhatsApp"
      onClick={handleClick}
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#25d366]/30 transition-all hover:translate-y-[-2px] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#25D366]"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">Fale no WhatsApp</span>
    </a>
  );
}
