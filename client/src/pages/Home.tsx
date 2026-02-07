import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OrganicDivider from '@/components/OrganicDivider';
import AppointmentForm from '@/components/AppointmentForm';
import { useQuickBooking } from '@/contexts/QuickBookingContext';
import FAQSection from '@/components/FAQSection';
import ValuesSection from '@/components/ValuesSection';
import ProfilePhoto from '@/components/ProfilePhoto';
import BackToTop from '@/components/BackToTop';
import ImageGallery from '@/components/ImageGallery';
import FadeIn from '@/components/FadeIn';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Shield, BookOpen, MessageCircle, ArrowRight, CheckCircle, Calendar } from 'lucide-react';
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
  const { config, isLoading } = useSiteConfig();
  
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
        <section className="py-16 md:py-24 lg:py-32">
          <div className="container">
            <FadeIn>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-accent font-semibold text-sm md:text-base uppercase tracking-wide">
                      Bem-vindo(a)
                    </p>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                      Espaço de escuta qualificada e segura
                    </h1>
                  </div>
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                    {config.aboutText || 'Sou psicólogo(a) graduado(a) e ofereço um espaço acolhedor onde você pode explorar seus pensamentos, emoções e desafios com confiança e sigilo profissional.'}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                      onClick={() => openModal()}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                      size="lg"
                    >
                      Agendar Consulta
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                    <Button
                      onClick={() => scrollToSection('sobre')}
                      variant="outline"
                      size="lg"
                      className="border-border hover:bg-muted hover:border-accent transition-all duration-200"
                    >
                      Conhecer Mais
                    </Button>
                  </div>

                  {/* Trust Indicators */}
                  <div className="flex flex-wrap gap-4 pt-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-accent" />
                      <span>{config.psychologistCrp || 'CRP-SP'} Ativo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-accent" />
                      <span>Sigilo Garantido</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-accent" />
                      <span>Online e Presencial</span>
                    </div>
                  </div>
                </div>

                {/* Imagem Hero */}
                <div className="hidden md:block relative">
                  <div className="absolute inset-0 bg-accent/10 rounded-lg blur-3xl -z-10"></div>
                  <img
                    src="/images/hero-psychologist.jpg"
                    alt="Ambiente acolhedor de terapia"
                    width="1200"
                    height="800"
                    fetchPriority="high"
                    className="w-full h-auto rounded-lg shadow-2xl object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        <OrganicDivider color="accent" className="mb-0" />

        {/* SOBRE MIM SECTION */}
        <section
          id="sobre"
          className="py-16 md:py-24 bg-secondary/10"
        >
          <div className="container">
            <FadeIn>
              <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
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

        <OrganicDivider color="accent" className="mb-0" />

        {/* AMBIENTE E CONSULTÓRIO SECTION */}
        <section className="py-16 md:py-24">
          <div className="container">
            <FadeIn>
              <div className="max-w-5xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Ambiente Acolhedor
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Um espaço pensado para o seu conforto e bem-estar
                  </p>
                </div>

                <ImageGallery
                  images={[
                    {
                      src: '/images/wellness-blue.jpg',
                      alt: 'Bem-estar e equilíbrio emocional',
                      caption: 'Espaço de Acolhimento',
                    },
                    {
                      src: '/images/healing-journey.jpg',
                      alt: 'Jornada de cura e transformação',
                      caption: 'Ambiente Tranquilo',
                    },
                    {
                      src: '/images/trust-connection.jpg',
                      alt: 'Conexão e confiança',
                      caption: 'Consultório Privativo',
                    },
                  ]}
                  columns={3}
                />
              </div>
            </FadeIn>
          </div>
        </section>

        <OrganicDivider color="secondary" className="mb-0" />

        {/* SERVIÇOS SECTION */}
        <section
          id="servicos"
          className="py-16 md:py-24"
        >
          <div className="container">
            <FadeIn>
              <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Áreas de Atuação
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Trabalho com diversas demandas e situações
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    'Ansiedade e Estresse',
                    'Autoestima e Autoimagem',
                    'Relacionamentos Interpessoais',
                    'Luto e Perdas',
                    'Transições de Vida',
                    'Desenvolvimento Pessoal',
                    'Questões LGBTQIA+',
                    'Orientação de Carreira',
                    'Conflitos Familiares',
                  ].map((area) => (
                    <div
                      key={area}
                      className="p-4 rounded-lg bg-background border border-border/50 hover:border-accent hover:shadow-md transition-all duration-200 group"
                    >
                      <p className="text-foreground font-medium group-hover:text-accent transition-colors">
                        {area}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-6 pt-8 border-t border-border/50">
                  <h3 className="font-bold text-xl text-foreground text-center">
                    Modalidades de Atendimento
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6 bg-accent/10 border-accent/30 hover:shadow-lg transition-all duration-300">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-accent" />
                          </div>
                          <p className="font-bold text-lg text-foreground">
                            Presencial
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Consultório localizado em{' '}
                          <strong className="text-foreground">
                            [Bairro, São Paulo]
                          </strong>
                          , com ambiente acolhedor e privativo.
                        </p>
                        <p className="text-xs text-muted-foreground/80">
                          📍 Endereço será fornecido no agendamento
                        </p>
                      </div>
                    </Card>

                    <Card className="p-6 bg-accent/10 border-accent/30 hover:shadow-lg transition-all duration-300">
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
                          💻 Mesma qualidade do atendimento presencial
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
                    className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
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

        {/* CONTEÚDO SECTION */}
        <section
          id="conteudo"
          className="py-16 md:py-24"
        >
          <div className="container">
            <FadeIn>
              <div className="max-w-5xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Conteúdo Educativo
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Artigos e reflexões sobre saúde mental e bem-estar
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[
                    {
                      title: 'O que é psicoterapia?',
                      excerpt:
                        'Entenda como funciona o processo terapêutico e seus benefícios.',
                      date: 'Em breve',
                      category: 'Sobre Terapia',
                    },
                    {
                      title: 'Como saber se preciso de terapia?',
                      excerpt:
                        'Sinais de que pode ser o momento de buscar ajuda profissional.',
                      date: 'Em breve',
                      category: 'Autoconhecimento',
                    },
                    {
                      title: 'Ansiedade: quando buscar ajuda',
                      excerpt:
                        'Compreendendo a ansiedade e seus sintomas no dia a dia.',
                      date: 'Em breve',
                      category: 'Saúde Mental',
                    },
                  ].map((article, idx) => (
                    <Card
                      key={idx}
                      className="p-6 border-border/50 hover:border-accent hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    >
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-accent uppercase tracking-wide">
                            {article.category}
                          </span>
                          <h3 className="font-bold text-lg text-foreground group-hover:text-accent transition-colors">
                            {article.title}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-border/30">
                          <p className="text-xs text-muted-foreground/60">
                            {article.date}
                          </p>
                          <ArrowRight className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="text-center pt-8">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-border hover:bg-muted hover:border-accent transition-all duration-200"
                  >
                    Ver Todos os Artigos
                    <BookOpen className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        <OrganicDivider color="accent" className="mb-0" />

        {/* AGENDAMENTO SECTION */}
        <section id="agendamento" className="py-16 md:py-24 bg-gradient-to-br from-accent/5 to-primary/5">
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
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
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

        {/* CONTATO SECTION */}
        <section id="contato" className="py-16 md:py-24 section-accent-bg">
          <div className="container">
            <FadeIn>
              <div className="max-w-2xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                  <h2 className="text-foreground">Entre em Contato</h2>
                  <p className="text-lg text-muted-foreground">
                    Estou disponível para agendar sua primeira consulta
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-6 text-center border-border/50">
                    <p className="text-sm text-muted-foreground mb-2">Telefone/WhatsApp</p>
                    <a
                      href="tel:[Telefone]"
                      className="text-accent font-semibold hover:underline"
                    >
                      [Telefone]
                    </a>
                  </Card>

                  <Card className="p-6 text-center border-border/50">
                    <p className="text-sm text-muted-foreground mb-2">E-mail</p>
                    <a
                      href="mailto:[Email]"
                      className="text-accent font-semibold hover:underline break-all"
                    >
                      [Email]
                    </a>
                  </Card>

                  <Card className="p-6 text-center border-border/50">
                    <p className="text-sm text-muted-foreground mb-2">Horários</p>
                    <p className="text-accent font-semibold">
                      [Horários de atendimento]
                    </p>
                  </Card>
                </div>

                <div className="bg-accent/10 border border-accent/20 rounded-lg p-8 text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Primeira Consulta:</strong> Espaço para conhecimento mútuo,
                    esclarecimento de dúvidas e definição de objetivos terapêuticos.
                  </p>
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
