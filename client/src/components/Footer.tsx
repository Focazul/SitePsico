import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Instagram, Linkedin, Mail, Phone, ShieldCheck, MapPin } from "lucide-react";
import { useSiteConfig } from "@/hooks/useSiteConfig";

// Footer completo com links, contato, redes sociais, selo CRP e newsletter placeholder
export default function Footer() {
  const { config } = useSiteConfig();
  return (
    <footer 
      role="contentinfo"
      className="bg-background/90 border-t border-border/80 pt-12 md:pt-16 pb-10"
    >
      <div className="container space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Marca e ética */}
          <div className="space-y-4">
            <div>
              <p className="text-[13px] uppercase tracking-[0.2em] text-muted-foreground">Psicologia</p>
              <h3 className="text-xl font-bold text-foreground leading-tight">{config.psychologistName}</h3>
              <p className="text-sm text-muted-foreground">{config.psychologistCrp || 'CRP'}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <span>Atendimento ético, sigiloso e responsável.</span>
            </div>
            <div className="text-xs text-muted-foreground/80">
              <a className="hover:text-accent transition-colors" href="https://site.cfp.org.br/codigo-de-etica/" target="_blank" rel="noreferrer">
                Código de Ética Profissional do Psicólogo
              </a>
            </div>
          </div>

          {/* Links principais */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Links</h4>
            <div className="grid gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-accent transition-colors">Home</Link>
              <Link href="/sobre" className="hover:text-accent transition-colors">Sobre</Link>
              <Link href="/servicos" className="hover:text-accent transition-colors">Serviços</Link>
              <Link href="/blog" className="hover:text-accent transition-colors">Conteúdo</Link>
              <Link href="/agendamento" className="hover:text-accent transition-colors">Agendamento</Link>
              <Link href="/contato" className="hover:text-accent transition-colors">Contato</Link>
            </div>
            <div className="grid gap-2 text-sm text-muted-foreground">
              <a href="#" className="hover:text-accent transition-colors">Política de Privacidade</a>
              <a href="#" className="hover:text-accent transition-colors">Termos de Uso</a>
            </div>
          </div>

          {/* Contato e redes */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contato</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <a href={`tel:${config.phone}`} className="flex items-center gap-2 hover:text-accent transition-colors">
                <Phone className="h-4 w-4 text-accent" /> {config.phone || '(11) 99999-9999'}
              </a>
              <a href={`mailto:${config.email}`} className="flex items-center gap-2 hover:text-accent transition-colors">
                <Mail className="h-4 w-4 text-accent" /> {config.email || 'contato@exemplo.com'}
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-accent mt-0.5" />
                <p className="leading-snug">{config.address || 'Atendimento online'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              {config.instagramUrl && (
                <a href={config.instagramUrl} target="_blank" rel="noreferrer" className="p-2 rounded-full border border-border hover:border-accent hover:text-accent transition-colors" aria-label="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {config.linkedinUrl && (
                <a href={config.linkedinUrl} target="_blank" rel="noreferrer" className="p-2 rounded-full border border-border hover:border-accent hover:text-accent transition-colors" aria-label="LinkedIn">
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Newsletter</h4>
            <p className="text-sm text-muted-foreground">
              Receba conteúdos e avisos sobre agenda. Sem spam.
            </p>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                alert('Inscrição registrada (placeholder). Integração virá na fase de backend.');
              }}
            >
              <Input type="email" name="email" placeholder="seuemail@exemplo.com" required className="bg-background" />
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                Inscrever
              </Button>
              <p className="text-xs text-muted-foreground/80">Você pode cancelar a inscrição a qualquer momento.</p>
            </form>
          </div>
        </div>

        <div className="border-t border-border/60 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} [Nome do Psicólogo]. Todos os direitos reservados.</p>
          <div className="flex items-center gap-3 text-xs">
            <span className="px-3 py-1 rounded-full border border-border bg-background/70">CRP 06/[Número] • Atendimento ético</span>
            <span className="px-3 py-1 rounded-full border border-border bg-background/70">LGPD-friendly</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
