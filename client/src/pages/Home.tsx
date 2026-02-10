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
import { Link } from 'wouter';
import { Shield, BookOpen, MessageCircle, ArrowRight, CheckCircle, Calendar } from 'lucide-react';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { trpc } from '@/lib/trpc';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

  const postsQuery = trpc.blog.getPosts.useQuery({ limit: 3, offset: 0 });
  const posts = postsQuery.data?.posts || [];

  const getExcerpt = (post: { excerpt?: string | null; content: string }) => {
    if (post.excerpt && post.excerpt.trim().length > 0) return post.excerpt;
    const plain = post.content
      .replace(/<[^>]+>/g, ' ')
      .replace(/[_*`>#-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return plain.length > 140 ? `${plain.slice(0, 140).trim()}...` : plain;
  };

  const formatDate = (date: Date | null | string) => {
    if (!date) return '';
    const parsed = typeof date === 'string' ? new Date(date) : date;
    return format(parsed, 'dd MMM yyyy', { locale: ptBR });
  };

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
              <div className="hero-shell p-6 md:p-10 lg:p-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-accent font-semibold text-sm md:text-base uppercase tracking-[0.3em]">
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
                      className="btn-gradient transition-all duration-200"
                      size="lg"
                    >
                      Agendar Consulta
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                    <Button
                      onClick={() => scrollToSection('sobre')}
                      variant="outline"
                      size="lg"
                      className="btn-outline-blue"
                    >
                      Conhecer Mais
                    </Button>
                  </div>

                  {/* Trust Indicators */}
                  <div className="flex flex-wrap gap-3 pt-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-2">
                      <CheckCircle className="w-5 h-5 text-accent" />
                      <span>{config.psychologistCrp || 'CRP-SP'} Ativo</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-2">
                      <CheckCircle className="w-5 h-5 text-accent" />
                      <span>Sigilo Garantido</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-2">
                      <CheckCircle className="w-5 h-5 text-accent" />
                      <span>Online e Presencial</span>
                    </div>
                  </div>
                  </div>

                  {/* Imagem Hero */}
                  <div className="hidden md:block">
                    <div className="hero-media-frame">
                      <div className="hero-orb hero-orb--primary" aria-hidden />
                      <div className="hero-orb hero-orb--accent" aria-hidden />
                      <img
                        src="/images/hero-psychologist.jpg"
                        alt="Ambiente acolhedor de terapia"
                        width="1200"
                        height="800"
                        fetchPriority="high"
                        className="hero-media-image w-full h-auto object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
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
          id="servicos"
          className="py-16 md:py-24 section-soft"
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

        {/* CONTEÚDO SECTION */}
        <section
          id="conteudo"
          className="py-16 md:py-24"
        >
          <div className="container">
            <FadeIn>
              <div className="max-w-5xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground title-accent-bg">
                    Conteúdo Educativo
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Artigos e reflexões sobre saúde mental e bem-estar
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {postsQuery.isLoading && (
                    Array.from({ length: 3 }).map((_, idx) => (
                      <Card
                        key={`loading-${idx}`}
                        className="p-6 border-border/50 animate-pulse"
                      >
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="h-3 w-24 rounded-full bg-muted" />
                            <div className="h-4 w-40 rounded-full bg-muted" />
                          </div>
                          <div className="h-3 w-full rounded-full bg-muted" />
                          <div className="h-3 w-5/6 rounded-full bg-muted" />
                          <div className="h-3 w-20 rounded-full bg-muted" />
                        </div>
                      </Card>
                    ))
                  )}

                  {!postsQuery.isLoading && posts.length === 0 && (
                    <div className="col-span-full text-center text-sm text-muted-foreground">
                      Os artigos serão publicados em breve.
                    </div>
                  )}

                  {posts.map((post) => (
                    <Card
                      key={post.id}
                      className="p-6 border-border/50 hover:border-accent hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    >
                      <Link href={`/blog/${post.slug}`} className="block space-y-4 h-full">
                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-accent uppercase tracking-wide">
                            {post.category?.name || 'Artigo'}
                          </span>
                          <h3 className="font-bold text-lg text-foreground group-hover:text-accent transition-colors">
                            {post.title}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {getExcerpt(post)}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-border/30">
                          <p className="text-xs text-muted-foreground/60">
                            {formatDate(post.publishedAt)}
                          </p>
                          <ArrowRight className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    </Card>
                  ))}
                </div>

                {posts.length > 0 && (
                  <div className="text-center pt-8">
                    <Link href="/blog" className="inline-flex">
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-border hover:bg-muted hover:border-accent transition-all duration-200"
                      >
                        Ver todos os artigos
                        <BookOpen className="ml-2 w-5 h-5" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </FadeIn>
          </div>
        </section>

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
