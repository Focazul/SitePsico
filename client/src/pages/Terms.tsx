import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OrganicDivider from '@/components/OrganicDivider';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { useSEO } from '@/hooks/useSEO';

export default function Terms() {
  const { config } = useSiteConfig();

  useSEO({
    title: 'Termos de Uso | Psicologia',
    description:
      'Conheça as regras de uso do site, os limites das informações públicas e as condições aplicáveis aos canais de contato e agendamento.',
    ogLocale: 'pt_BR',
    canonicalUrl: typeof window !== 'undefined' ? `${window.location.origin}/termos` : undefined,
    ogUrl: typeof window !== 'undefined' ? `${window.location.origin}/termos` : undefined,
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main id="main-content" className="flex-1">
        <section className="py-16 md:py-24 section-light">
          <div className="container max-w-4xl space-y-6">
            <Badge className="bg-accent/15 text-accent border-accent/30 rounded-full px-4 py-1">
              Documento institucional
            </Badge>
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">Termos de Uso</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Estes termos regulam o acesso e o uso deste site, dos formulários de contato, do sistema de
                agendamento e dos conteúdos publicados, preservando a ética profissional e a clareza da relação com os
                visitantes.
              </p>
            </div>
          </div>
        </section>

        <OrganicDivider color="accent" className="mb-0" />

        <section className="py-16 md:py-20 section-soft">
          <div className="container max-w-4xl">
            <Card className="p-6 md:p-8 space-y-8 border-border/60 bg-card/95">
              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">1. Finalidade do site</h2>
                <p className="text-muted-foreground leading-relaxed">
                  O site apresenta informações institucionais, conteúdos educativos, canais de contato e recursos para
                  solicitação de agendamento. O conteúdo tem finalidade informativa e não substitui avaliação clínica,
                  acompanhamento psicológico contínuo ou atendimento de urgência.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">2. Agendamentos e contatos</h2>
                <p className="text-muted-foreground leading-relaxed">
                  O envio de formulários não garante atendimento imediato nem reserva automática fora da confirmação
                  apresentada pelo sistema ou pelo retorno profissional. O uso de dados falsos, automação abusiva ou
                  qualquer tentativa de comprometer o funcionamento do site pode levar ao bloqueio do acesso.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">3. Responsabilidade do usuário</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Ao utilizar o site, você se compromete a fornecer informações verdadeiras, agir com boa-fé e utilizar
                  os canais disponíveis apenas para fins legítimos relacionados à busca de informações ou atendimento.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">4. Propriedade intelectual</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Textos, identidade visual, materiais institucionais e conteúdos do blog pertencem ao site e ao seu
                  responsável, salvo indicação em contrário. Não é permitido reproduzir, distribuir ou explorar esse
                  material sem autorização prévia.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">5. Limites de responsabilidade</h2>
                <p className="text-muted-foreground leading-relaxed">
                  O site busca manter informações atualizadas e operação estável, mas não garante indisponibilidade zero
                  ou ausência absoluta de falhas técnicas. Conteúdos publicados não configuram promessa de resultado e
                  devem ser compreendidos dentro de seu caráter informativo.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">6. Alterações</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Estes termos podem ser atualizados sempre que necessário para refletir mudanças no site, nas rotinas
                  operacionais ou em exigências legais. A versão vigente será sempre a publicada nesta página.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">7. Contato</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Em caso de dúvidas sobre estes termos, entre em contato pelos canais oficiais:
                </p>
                <ul className="text-muted-foreground space-y-1">
                  <li><strong className="text-foreground">Responsável:</strong> {config.psychologistName}</li>
                  <li><strong className="text-foreground">Email:</strong> {config.email}</li>
                  <li><strong className="text-foreground">Telefone/WhatsApp:</strong> {config.phone}</li>
                </ul>
              </section>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
