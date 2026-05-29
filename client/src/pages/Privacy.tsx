import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OrganicDivider from '@/components/OrganicDivider';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { useSEO } from '@/hooks/useSEO';

export default function Privacy() {
  const { config } = useSiteConfig();

  useSEO({
    title: 'Política de Privacidade | Psicologia',
    description:
      'Saiba como os dados pessoais enviados pelo site são tratados com base na LGPD, no sigilo profissional e nas boas práticas de segurança.',
    ogLocale: 'pt_BR',
    canonicalUrl: typeof window !== 'undefined' ? `${window.location.origin}/privacidade` : undefined,
    ogUrl: typeof window !== 'undefined' ? `${window.location.origin}/privacidade` : undefined,
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
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">Política de Privacidade</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Esta política explica como os dados enviados neste site são tratados, armazenados e protegidos,
                respeitando a Lei Geral de Proteção de Dados (LGPD), o sigilo profissional e a finalidade exclusiva
                de atendimento psicológico.
              </p>
            </div>
          </div>
        </section>

        <OrganicDivider color="accent" className="mb-0" />

        <section className="py-16 md:py-20 section-soft">
          <div className="container max-w-4xl">
            <Card className="p-6 md:p-8 space-y-8 border-border/60 bg-card/95">
              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">1. Quais dados podem ser coletados</h2>
                <p className="text-muted-foreground leading-relaxed">
                  O site pode receber dados informados voluntariamente por você em formulários de contato e
                  agendamento, como nome, email, telefone, modalidade desejada, preferências de horário e mensagens
                  relacionadas ao atendimento.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">2. Finalidade do uso</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Os dados são utilizados apenas para responder solicitações, organizar pedidos de agendamento,
                  encaminhar orientações iniciais, confirmar horários e manter a comunicação necessária ao
                  atendimento profissional.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">3. Base legal e consentimento</h2>
                <p className="text-muted-foreground leading-relaxed">
                  O tratamento ocorre com base no seu consentimento e no legítimo interesse de viabilizar o contato
                  profissional solicitado por você. Ao enviar um formulário, você declara estar ciente dessa
                  finalidade e autoriza o retorno pelos canais informados.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">4. Cookies e analytics</h2>
                <p className="text-muted-foreground leading-relaxed">
                  O site utiliza cookies essenciais para funcionamento e, quando autorizado, cookies analíticos para
                  mensurar visitas, páginas acessadas e interações relevantes. Você pode aceitar ou recusar cookies
                  opcionais no banner exibido na primeira visita.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">5. Compartilhamento e retenção</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Os dados não são comercializados. Eles podem ser processados por serviços estritamente necessários ao
                  funcionamento do site, como infraestrutura, envio de email e agenda, sempre dentro da finalidade
                  descrita nesta política. As informações são mantidas pelo tempo necessário para atendimento,
                  cumprimento de obrigações legais e segurança operacional.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">6. Seus direitos</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Você pode solicitar confirmação de tratamento, acesso, correção, anonimização, exclusão ou revogação
                  do consentimento, observados os limites legais e éticos aplicáveis ao exercício profissional.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">7. Contato para privacidade</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Para dúvidas sobre esta política ou sobre o tratamento dos seus dados, utilize os canais abaixo:
                </p>
                <ul className="text-muted-foreground space-y-1">
                  <li><strong className="text-foreground">Responsável:</strong> {config.psychologistName}</li>
                  <li><strong className="text-foreground">Email:</strong> {config.email}</li>
                  <li><strong className="text-foreground">Telefone/WhatsApp:</strong> {config.phone}</li>
                  <li><strong className="text-foreground">Endereço profissional:</strong> {config.address}</li>
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
