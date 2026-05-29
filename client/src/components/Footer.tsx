import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Instagram, Linkedin, Mail, Phone, ShieldCheck, MapPin, MessageCircle, BookOpen } from 'lucide-react';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { getWhatsAppLink } from '@/hooks/useWhatsAppConfig';

export default function Footer() {
  const { config } = useSiteConfig();
  const whatsappLink = getWhatsAppLink({
    phoneNumber: config.whatsappNumber,
    message: 'Olá! Gostaria de saber mais sobre os atendimentos.',
  });

  return (
    <footer
      role="contentinfo"
      className="bg-gradient-to-b from-background/90 to-background border-t border-border/80 pt-12 md:pt-16 pb-10"
    >
      <div className="container space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div>
              <p className="text-[13px] uppercase tracking-[0.2em] text-muted-foreground">Psicologia</p>
              <h3 className="text-xl font-bold text-foreground leading-tight">{config.psychologistName}</h3>
              <p className="text-sm text-muted-foreground">{config.psychologistCrp || 'CRP ativo'}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <span>Atendimento ético, sigiloso e responsável.</span>
            </div>
            <div className="text-xs text-muted-foreground/80">
              <a
                className="hover:text-accent transition-colors"
                href="https://site.cfp.org.br/codigo-de-etica/"
                target="_blank"
                rel="noreferrer"
              >
                Código de Ética Profissional do Psicólogo
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Navegação</h4>
            <div className="grid gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-accent transition-colors">Início</Link>
              <Link href="/sobre" className="hover:text-accent transition-colors">Sobre</Link>
              <Link href="/servicos" className="hover:text-accent transition-colors">Áreas de atuação</Link>
              <Link href="/agendamento" className="hover:text-accent transition-colors">Agendamento</Link>
              <Link href="/contato" className="hover:text-accent transition-colors">Contato</Link>
              <Link href="/blog" className="hover:text-accent transition-colors">Blog</Link>
            </div>
            <div className="grid gap-2 text-sm text-muted-foreground">
              <Link href="/privacidade" className="hover:text-accent transition-colors">Política de Privacidade</Link>
              <Link href="/termos" className="hover:text-accent transition-colors">Termos de Uso</Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contato</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <a href={`tel:${config.phone}`} className="flex items-center gap-2 hover:text-accent transition-colors">
                <Phone className="h-4 w-4 text-accent" /> {config.phone}
              </a>
              <a href={`mailto:${config.email}`} className="flex items-center gap-2 hover:text-accent transition-colors">
                <Mail className="h-4 w-4 text-accent" /> {config.email}
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-accent mt-0.5" />
                <p className="leading-snug">{config.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              {config.instagramUrl && (
                <a
                  href={config.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-full border border-border hover:border-accent hover:text-accent transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {config.linkedinUrl && (
                <a
                  href={config.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-full border border-border hover:border-accent hover:text-accent transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Próximo passo</h4>
            <p className="text-sm text-muted-foreground">
              Escolha o canal que fizer mais sentido para você e receba orientação inicial com rapidez.
            </p>
            <div className="grid gap-3">
              <Button asChild className="w-full btn-lapis-lazuli">
                <Link href="/agendamento">
                  <CalendarButtonContent />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full btn-outline-blue">
                <a href={whatsappLink} target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                </a>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                <Link href="/blog">
                  <BookOpen className="mr-2 h-4 w-4" /> Ler artigos do blog
                </Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground/80">Atendimento online e presencial, com resposta em até 24h úteis.</p>
          </div>
        </div>

        <div className="border-t border-border/60 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {config.psychologistName}. Todos os direitos reservados.</p>
          <div className="flex items-center gap-3 text-xs">
            <span className="px-3 py-1 rounded-full border border-border bg-background/70">{config.psychologistCrp || 'CRP ativo'} • Atendimento ético</span>
            <span className="px-3 py-1 rounded-full border border-border bg-background/70">LGPD e consentimento ativos</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function CalendarButtonContent() {
  return <><MessageCircle className="mr-2 h-4 w-4" /> Agendar consulta</>;
}
