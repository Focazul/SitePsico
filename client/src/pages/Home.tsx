import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OrganicDivider from '@/components/OrganicDivider';
import AppointmentForm from '@/components/AppointmentForm';
import { useQuickBooking } from '@/contexts/QuickBookingContext';
import FAQSection from '@/components/FAQSection';
import ValuesSection from '@/components/ValuesSection';
import ProfilePhoto from '@/components/ProfilePhoto';
import BackToTop from '@/components/BackToTop';
import FadeIn from '@/components/FadeIn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MessageCircle, ArrowRight, CheckCircle, Calendar } from 'lucide-react';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/**
 * Home Page - Site Psicólogo SP
 * Design: Minimalismo Humanista
 * - Estrutura assimétrica com muito respiro vertical
 * - Tipografia em camadas (Poppins + Lora)
 * - Cores: Branco, Cinza natural, Verde menta, Azul profundo
 * - Animações suaves e discretas
 * 
 * Nota: Página pública, não requer autenticação
 */

export default function Home() {
  const { openModal } = useQuickBooking();
  
  // Get site configuration from database
  const { config } = useSiteConfig();
  
  // Update document title
  useDocumentTitle();


  // Smooth scroll handler
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main id="main-content" className="flex-1 relative z-10">
        {/* HERO SECTION */}
        <section className="hero py-20 md:py-24">
          <div className="container hero-grid">
            <div className="reveal space-y-8">
              <div className="space-y-4">
                <p className="text-accent font-bold text-xs uppercase tracking-[0.3em]" style={{ color: 'var(--accent)' }}>
                  Bem-vindo(a)
                </p>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight" style={{ color: 'color-mix(in oklab, var(--primary) 70%, #0b1220 30%)' }}>
                  Espaço de escuta qualificada e segura
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {config.aboutText || 'Sou psicólogo(a) graduado(a) e ofereço um espaço acolhedor para explorar pensamentos, emoções e desafios com sigilo profissional.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={() => openModal()}
                  className="btn primary"
                >
                  Agendar Consulta
                </button>
                <button
                  onClick={() => scrollToSection('sobre')}
                  className="btn outline"
                >
                  Conhecer Mais
                </button>
              </div>

              <div className="flex flex-wrap gap-4 mt-6 text-sm font-medium" style={{ fontSize: '0.9rem' }}>
                <span>CRP ativo</span>
                <span>Sigilo garantido</span>
                <span>Online e presencial</span>
              </div>
            </div>

            <div className="hero-card reveal delay-2"></div>
          </div>
        </section>

        <OrganicDivider color="accent" className="mb-0" />

        {/* SOBRE MIM SECTION */}
        <section
          id="sobre"
          className="py-16 md:py-24 section-soft"
        >
          <div className="container">
            <FadeIn>
              <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground title-accent-bg">
                    Sobre Mim
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Formação, experiência e compromisso ético
                  </p>
                </div>

                {/* Profile Photo and Bio */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                  {/* Photo Column */}
                  <div className="flex flex-col items-center space-y-4">
                    <ProfilePhoto
                      src=""
                      alt="Foto profissional do psicólogo"
                      size="xl"
                    />
                    <div className="text-center">
                      <p className="font-bold text-lg text-foreground">
                        {config.psychologistName}
                      </p>
                      <p className="text-sm text-accent font-semibold">
                        {config.psychologistCrp || 'CRP'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Psicólogo(a) Clínico(a)
                      </p>
                    </div>
                  </div>

                  {/* Bio Column */}
                  <div className="md:col-span-2 prose prose-lg max-w-none text-muted-foreground space-y-6">
                    <div dangerouslySetInnerHTML={{ __html: config.aboutText || '<p>Olá, sou psicólogo(a) graduado(a) e registrado(a) no Conselho Regional de Psicologia. Minha trajetória na psicologia é guiada pelo compromisso com a ética, o acolhimento e o respeito à singularidade de cada indivíduo.</p>' }} />
                  </div>
                </div>

                {/* Credentials */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
                  <Card className="p-4 text-center border-accent/30">
                    <p className="text-2xl font-bold text-accent">{config.psychologistCrp || 'CRP-SP'}</p>
                    <p className="text-sm text-muted-foreground">
                      Registro Profissional
                    </p>
                  </Card>
                  <Card className="p-4 text-center border-accent/30">
                    <p className="text-2xl font-bold text-accent">[Ano]</p>
                    <p className="text-sm text-muted-foreground">Ano de Formação</p>
                  </Card>
                  <Card className="p-4 text-center border-accent/30">
                    <p className="text-2xl font-bold text-accent">100%</p>
                    <p className="text-sm text-muted-foreground">
                      Conformidade Ética
                    </p>
                  </Card>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        <OrganicDivider color="secondary" className="mb-0" />

        {/* VALORES E PRINCÍPIOS SECTION */}
        <ValuesSection />

        {/* SERVIÇOS SECTION */}
        <section
          id="areas"
          className="py-16 md:py-24 section-light"
        >
          <div className="container">
            <FadeIn>
              <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground title-accent-bg">
                    Áreas de Atuação
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Trabalho com diversas demandas e situações
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  {[
                    'Ansiedade e Estresse',
                    'Autoestima e Autoimagem',
                    'Relacionamentos Interpessoais',
                    'Luto e Perdas',
                    'Transições de Vida',
                    'Desenvolvimento Pessoal',
                    'Orientação de Carreira',
                    'Conflitos Familiares',
                  ].map((area) => (
                    <Badge key={area} className="px-4 py-2 text-sm">
                      {area}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-6 pt-8 border-t border-border/50">
                  <h3 className="font-bold text-xl text-foreground text-center">
                    Modalidade de Atendimento
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6 bg-card/95 border-accent/20 hover:shadow-lg transition-all duration-300">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                            <MessageCircle className="w-5 h-5 text-accent" />
                          </div>
                          <p className="font-bold text-lg text-foreground">Online</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Via plataforma segura e confidencial, conforme{' '}
                          <strong className="text-foreground">
                            Resolução CFP nº 11/2018
                          </strong>
                          .
                        </p>
                        <p className="text-xs text-muted-foreground/80">
                          💻 Atendimento seguro e de qualidade
                        </p>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* CTA */}
                <div className="text-center pt-8">
                  <Button
                    onClick={() => scrollToSection('agendamento')}
                    size="lg"
                    className="btn-lapis-lazuli transition-all duration-200 hover:scale-105"
                  >
                    Ver Disponibilidade
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        <OrganicDivider color="secondary" className="mb-0" />

        {/* FAQ SECTION */}
        <FAQSection />

        <OrganicDivider color="accent" className="mb-0" />

        {/* AGENDAMENTO SECTION */}
        <section id="agendamento" className="py-16 md:py-24 section-soft">
          <div className="container">
            <FadeIn>
              <div className="max-w-4xl mx-auto space-y-12">
                {/* Header com destaque visual */}
                <div className="text-center space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full">
                    <Calendar className="w-5 h-5 text-accent" />
                    <span className="text-sm font-semibold text-accent">
                      Agende sua consulta
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground title-accent-bg">
                    Dê o primeiro passo
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Preencha o formulário abaixo e entraremos em contato em até 24h
                    para confirmar seu agendamento. Todas as informações são
                    confidenciais.
                  </p>
                </div>

                {/* Formulário com card destacado */}
                <Card className="p-8 border-accent/20 shadow-xl">
                  <AppointmentForm />
                </Card>

                {/* Trust indicators */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5 text-accent" />
                    <span>Resposta em 24h</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5 text-accent" />
                    <span>100% Confidencial</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5 text-accent" />
                    <span>Sem compromisso</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        <OrganicDivider color="secondary" className="mb-0" />
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
