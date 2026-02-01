/**
 * SkipToContent Component
 * 
 * Link de acessibilidade que permite usuários de teclado/screen reader
 * pular diretamente para o conteúdo principal da página
 * 
 * WCAG 2.1 AA - Critério 2.4.1 (Bypass Blocks)
 */

export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-6 focus:py-3 focus:bg-accent focus:text-accent-foreground focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
    >
      Pular para o conteúdo principal
    </a>
  );
}
