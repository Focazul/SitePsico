import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cookie, X } from "lucide-react";

/**
 * Banner de consentimento de cookies (LGPD/GDPR)
 * Aparece apenas na primeira visita e persiste a escolha no localStorage
 */
export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Verifica se o usuário já aceitou/rejeitou
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      // Mostra o banner após 1 segundo
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setShow(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookie_consent", "rejected");
    setShow(false);
    // Se rejeitado, desabilita analytics (opcional)
    (window as any)["ga-disable-GA_MEASUREMENT_ID"] = true;
  };

  const handleClose = () => {
    // Apenas fecha sem salvar (vai aparecer novamente)
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 animate-in slide-in-from-bottom duration-500">
      <Card className="max-w-4xl mx-auto bg-white/95 backdrop-blur-lg border-gray-200 shadow-2xl">
        <div className="p-4 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Cookie className="w-5 h-5 text-amber-600" />
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                    Este site utiliza cookies
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Usamos cookies e tecnologias semelhantes para melhorar sua experiência, 
                    analisar o tráfego do site e personalizar conteúdo. Ao clicar em "Aceitar", 
                    você concorda com o uso de cookies conforme nossa{" "}
                    <a href="/privacidade" className="underline text-blue-600 hover:text-blue-800">
                      Política de Privacidade
                    </a>.
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAccept}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                >
                  Aceitar todos
                </Button>
                <Button
                  onClick={handleReject}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6"
                >
                  Rejeitar opcionais
                </Button>
              </div>

              <p className="text-xs text-gray-500">
                🍪 <strong>Cookies essenciais:</strong> Necessários para o funcionamento básico do site (sempre ativos).
                <br />
                📊 <strong>Cookies analíticos:</strong> Nos ajudam a entender como você usa o site (opcional).
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
